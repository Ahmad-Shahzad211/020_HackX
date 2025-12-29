from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, status
from typing import List
from ..schemas.admin_schemas import (
    CreateCollectionRequest,
    CreateCollectionResponse,
    CollectionInfo,
    ListCollectionsResponse,
    IngestResponse,
    DeleteCollectionResponse
)
from ....core.security import require_admin_role
from ....services import qdrant_admin_service_instance

router = APIRouter()

MAX_FILES_PER_REQUEST = 5


def get_admin_service(): return qdrant_admin_service_instance

@router.get("/collections", response_model=ListCollectionsResponse)
async def list_collections(
    admin_id: str = Depends(require_admin_role),
    admin_service = Depends(get_admin_service)
):
    """List all Qdrant collections with their vector counts."""
    print(f"Admin {admin_id} listing collections...")
    collections = admin_service.list_collections()
    return ListCollectionsResponse(
        collections=[CollectionInfo(**col) for col in collections]
    )


@router.post("/collections", response_model=CreateCollectionResponse)
async def create_collection(
    request: CreateCollectionRequest,
    admin_id: str = Depends(require_admin_role),
    admin_service = Depends(get_admin_service)
):
    """Create a new Qdrant collection."""
    print(f"Admin {admin_id} creating collection '{request.name}'...")
    try:
        result = admin_service.create_collection(request.name)
        return CreateCollectionResponse(**result)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create collection: {str(e)}"
        )


@router.delete("/collections/{name}", response_model=DeleteCollectionResponse)
async def delete_collection(
    name: str,
    admin_id: str = Depends(require_admin_role),
    admin_service = Depends(get_admin_service)
):
    """Delete a Qdrant collection."""
    print(f"Admin {admin_id} deleting collection '{name}'...")
    try:
        result = admin_service.delete_collection(name)
        return DeleteCollectionResponse(**result)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete collection: {str(e)}"
        )


@router.post("/collections/{name}/ingest", response_model=IngestResponse)
async def ingest_pdfs(
    name: str,
    files: List[UploadFile] = File(...),
    admin_id: str = Depends(require_admin_role),
    admin_service = Depends(get_admin_service)
):
    """
    Upload and ingest PDF files into a Qdrant collection.
    Maximum 5 files per request.
    """
    print(f"Admin {admin_id} ingesting files into collection '{name}'...")
    
    # Validate file count
    if len(files) > MAX_FILES_PER_REQUEST:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Maximum {MAX_FILES_PER_REQUEST} files allowed per request. Got {len(files)}."
        )
    
    # Validate file types
    for file in files:
        if not file.filename.lower().endswith('.pdf'):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Only PDF files are allowed. Got: {file.filename}"
            )
    
    try:
        result = await admin_service.ingest_pdfs(name, files)
        return IngestResponse(**result)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Ingestion failed: {str(e)}"
        )
