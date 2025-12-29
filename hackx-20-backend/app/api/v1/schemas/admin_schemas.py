from pydantic import BaseModel, Field
from typing import List, Optional


class CreateCollectionRequest(BaseModel):
    """Request body for creating a new Qdrant collection."""
    name: str = Field(..., description="Name of the collection to create", min_length=1, max_length=64)


class CreateCollectionResponse(BaseModel):
    """Response after successfully creating a collection."""
    name: str
    message: str


class CollectionInfo(BaseModel):
    """Information about a single Qdrant collection."""
    name: str
    vectors_count: int


class ListCollectionsResponse(BaseModel):
    """Response containing list of all collections."""
    collections: List[CollectionInfo]


class IngestResponse(BaseModel):
    """Response after successfully ingesting PDF documents."""
    collection_name: str
    files_processed: int
    chunks_created: int
    message: str


class DeleteCollectionResponse(BaseModel):
    """Response after deleting a collection."""
    name: str
    message: str


class ErrorResponse(BaseModel):
    """Standard error response."""
    detail: str
