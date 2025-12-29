import tempfile
import pathlib
import uuid
from typing import List, Dict, Any
from fastapi import UploadFile
import pymupdf4llm
from qdrant_client import AsyncQdrantClient, models
from ..core.config import settings


class QdrantAdminService:
    """
    Admin service for managing Qdrant collections and ingesting PDF documents.
    Handles the full RAG pipeline: PDF extraction, chunking, embedding, and storage.
    """
    
    def __init__(self, embedding_service):
        self.client = AsyncQdrantClient(
            url=settings.QDRANT_URL, 
            api_key=settings.QDRANT_API_KEY or None,
            timeout=60,  # Increase timeout to handle large payloads
            check_compatibility=False
        )
        self.embedding_service = embedding_service
        self.vector_size = 1536  # OpenAI text-embedding-3-small dimension
        self.chunk_size = getattr(settings, 'CHUNK_SIZE', 1000)
        self.chunk_overlap = getattr(settings, 'CHUNK_OVERLAP', 200)
        print(f"Initialized QdrantAdminService with chunk_size={self.chunk_size}, chunk_overlap={self.chunk_overlap}")

    # --- Collection Management ---
    
    async def collection_exists(self, name: str) -> bool:
        """Check if a collection exists."""
        try:
            return await self.client.collection_exists(collection_name=name)
        except Exception as e:
            print(f"Error checking collection existence: {e}")
            return False

    async def create_collection(self, name: str) -> Dict[str, Any]:
        """
        Create a new Qdrant collection with the standard configuration.
        Uses binary quantization for memory efficiency (matching notebook approach).
        """
        print(f"Creating collection '{name}'...")
        if await self.collection_exists(name):
            return {"name": name, "message": f"Collection '{name}' already exists."}
        
        try:
            await self.client.create_collection(
                collection_name=name,
                vectors_config=models.VectorParams(
                    size=self.vector_size,
                    distance=models.Distance.COSINE,
                    on_disk=True
                ),
                quantization_config=models.BinaryQuantization(
                    binary=models.BinaryQuantizationConfig(
                        always_ram=True
                    )
                )
            )
            print(f"Collection '{name}' created successfully.")
            return {"name": name, "message": f"Collection '{name}' created successfully."}
        except Exception as e:
            print(f"Error creating collection '{name}': {e}")
            raise

    async def list_collections(self) -> List[Dict[str, Any]]:
        """List all collections with their vector counts."""
        print("Listing all collections...")
        try:
            collections_response = await self.client.get_collections()
            result = []
            for col in collections_response.collections:
                try:
                    info = await self.client.get_collection(col.name)
                    # Use points_count instead of vectors_count
                    result.append({
                        "name": col.name,
                        "vectors_count": info.points_count or 0
                    })
                except Exception as e:
                    print(f"Error getting info for collection '{col.name}': {e}")
                    result.append({"name": col.name, "vectors_count": 0})
            return result
        except Exception as e:
            print(f"Error listing collections: {e}")
            return []

    async def delete_collection(self, name: str) -> Dict[str, Any]:
        """Delete a collection."""
        print(f"Deleting collection '{name}'...")
        if not await self.collection_exists(name):
            return {"name": name, "message": f"Collection '{name}' does not exist."}
        
        try:
            await self.client.delete_collection(collection_name=name)
            print(f"Collection '{name}' deleted successfully.")
            return {"name": name, "message": f"Collection '{name}' deleted successfully."}
        except Exception as e:
            print(f"Error deleting collection '{name}': {e}")
            raise

    # --- PDF Processing ---
    
    def _chunk_text(self, text: str) -> List[str]:
        """
        Split text into chunks with overlap.
        Simple character-based chunking for now.
        """
        if not text or len(text) <= self.chunk_size:
            return [text] if text else []
        
        chunks = []
        start = 0
        while start < len(text):
            end = start + self.chunk_size
            chunk = text[start:end]
            chunks.append(chunk)
            start = end - self.chunk_overlap
        
        return chunks

    async def ingest_pdfs(self, collection_name: str, files: List[UploadFile]) -> Dict[str, Any]:
        """
        Full ingestion pipeline:
        1. Save PDFs to temp directory
        2. Extract text using pymupdf4llm
        3. Split into chunks
        4. Generate embeddings
        5. Upsert to Qdrant with metadata
        """
        print(f"Starting ingestion of {len(files)} files into collection '{collection_name}'...")
        
        if not await self.collection_exists(collection_name):
            raise ValueError(f"Collection '{collection_name}' does not exist. Please create it first.")
        
        total_chunks = 0
        files_processed = 0
        
        with tempfile.TemporaryDirectory() as temp_dir:
            for file in files:
                if not file.filename.lower().endswith('.pdf'):
                    print(f"Skipping non-PDF file: {file.filename}")
                    continue
                
                print(f"Processing file: {file.filename}")
                
                # Save to temp file
                temp_path = pathlib.Path(temp_dir) / file.filename
                content = await file.read()
                temp_path.write_bytes(content)
                
                try:
                    # Extract text as markdown using pymupdf4llm
                    md_text = pymupdf4llm.to_markdown(str(temp_path))
                    
                    if not md_text or len(md_text.strip()) == 0:
                        print(f"  - No text extracted from {file.filename}, skipping...")
                        continue
                    
                    # Chunk the text
                    chunks = self._chunk_text(md_text)
                    print(f"  - Created {len(chunks)} chunks from {file.filename}")
                    
                    # Process chunks in batches for embedding
                    points = []
                    for i, chunk in enumerate(chunks):
                        if not chunk.strip():
                            continue
                        
                        # Generate embedding
                        embedding = await self.embedding_service.embed_query(chunk)
                        if not embedding:
                            print(f"  - Failed to generate embedding for chunk {i}, skipping...")
                            continue
                        
                        # Create point with metadata
                        point_id = str(uuid.uuid4())
                        points.append(models.PointStruct(
                            id=point_id,
                            vector=embedding,
                            payload={
                                "file_name": file.filename,
                                "chunk_index": i,
                                "text": chunk,
                                # LlamaIndex compatible format
                                "_node_content": f'{{"text": {repr(chunk)}}}'
                            }
                        ))
                    
                    # Upsert points to Qdrant
                    if points:
                        await self.client.upsert(
                            collection_name=collection_name,
                            points=points
                        )
                        total_chunks += len(points)
                        print(f"  - Upserted {len(points)} points for {file.filename}")
                    
                    files_processed += 1
                    
                
                except Exception as e:
                    print(f"  - Error processing {file.filename}: {e}")
                    continue
        
        result = {
            "collection_name": collection_name,
            "files_processed": files_processed,
            "chunks_created": total_chunks,
            "message": f"Successfully ingested {files_processed} files with {total_chunks} chunks."
        }
        print(f"Ingestion complete: {result}")
        return result
