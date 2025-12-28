from qdrant_client import QdrantClient, models
from ..core.config import settings
from typing import List
import json

class ScopedKnowledgeRetriever:
    """
    A Knowledge Retriever that is initialized for a SPECIFIC scope (category)
    and will only search for documents within that scope.
    """
    def __init__(self, embedding_service, collection_name: str):
        self.client = QdrantClient(url=settings.QDRANT_URL, api_key=settings.QDRANT_API_KEY or None)
        self.embedding_service = embedding_service
        self.collection_name = collection_name
        print(f"Initialized ScopedKnowledgeRetriever for Qdrant collection: '{self.collection_name}'")

    async def search(self, query: str, top_k: int = 3) -> List[str]:
        """
        Searches the vector DB for the top_k most relevant chunks,
        but filters to only include results from its assigned scope.
        """
        print(f"Searching Qdrant collection '{self.collection_name}' for: '{query[:70]}...'")
        try:
            query_embedding = await self.embedding_service.embed_query(query)
            if not query_embedding:
                print("  - Embedding generation failed. Returning empty.")
                return []
            
            search_result = self.client.search(
                collection_name=self.collection_name,
                query_vector=query_embedding,
                limit=top_k,
                with_payload=True,
                score_threshold=0.5
            )
            print(f"  - Qdrant RAW search result: {search_result}")
            
            found_docs = []
            for hit in search_result:
                if hit.payload and '_node_content' in hit.payload:
                    try:
                        node_content = json.loads(hit.payload['_node_content'])
                        if 'text' in node_content:
                            found_docs.append(node_content['text'])
                    except (json.JSONDecodeError, TypeError):
                        print(f"  - WARNING: Could not parse _node_content for point {hit.id}")
                        continue
            
            print(f"  - Extracted {len(found_docs)} documents from payload.")
            return found_docs
        except Exception as e:
            print(f"Error during Qdrant search for collection '{self.collection_name}': {e}")
            import traceback
            traceback.print_exc()
            return []