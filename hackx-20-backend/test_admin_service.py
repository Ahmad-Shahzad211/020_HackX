"""
Manual Test Script for QdrantAdminService
Tests collection management and PDF ingestion functionality.
"""
import asyncio
import pathlib
from app.services import qdrant_admin_service_instance

# Configuration
TEST_COLLECTION_NAME = "test_collection"
PDF_PATH = pathlib.Path("temp/SBP Rules Non-Bank Financial Institutions.pdf")


async def test_admin_service():
    """Manual test suite for QdrantAdminService."""
    
    service = qdrant_admin_service_instance
    
    print("=" * 80)
    print("STARTING MANUAL TESTS FOR QDRANT ADMIN SERVICE")
    print("=" * 80)
    
    # Test 1: List existing collections
    print("\n[TEST 1] Listing all existing collections...")
    try:
        collections = await service.list_collections()
        print(f"✓ Found {len(collections)} collections:")
        for col in collections:
            print(f"  - {col['name']}: {col['vectors_count']} vectors")
    except Exception as e:
        print(f"✗ Failed to list collections: {e}")
        return
    
    # Test 2: Delete test collection if it exists (cleanup from previous runs)
    print(f"\n[TEST 2] Cleaning up: Checking if '{TEST_COLLECTION_NAME}' exists...")
    try:
        if await service.collection_exists(TEST_COLLECTION_NAME):
            print(f"  - Collection exists, deleting...")
            result = await service.delete_collection(TEST_COLLECTION_NAME)
            print(f"  - ✓ {result['message']}")
        else:
            print(f"  - Collection does not exist, skipping cleanup")
    except Exception as e:
        print(f"✗ Cleanup failed: {e}")
    
    # Test 3: Create new test collection
    print(f"\n[TEST 3] Creating new collection '{TEST_COLLECTION_NAME}'...")
    try:
        result = await service.create_collection(TEST_COLLECTION_NAME)
        print(f"✓ {result['message']}")
    except Exception as e:
        print(f"✗ Failed to create collection: {e}")
        return
    
    # Test 4: Verify collection was created
    print(f"\n[TEST 4] Verifying collection exists...")
    try:
        exists = await service.collection_exists(TEST_COLLECTION_NAME)
        if exists:
            print(f"✓ Collection '{TEST_COLLECTION_NAME}' confirmed")
        else:
            print(f"✗ Collection '{TEST_COLLECTION_NAME}' not found!")
            return
    except Exception as e:
        print(f"✗ Verification failed: {e}")
        return
    
    # Test 5: Test PDF ingestion
    print(f"\n[TEST 5] Testing PDF ingestion...")
    print(f"  - PDF: {PDF_PATH}")
    
    if not PDF_PATH.exists():
        print(f"✗ PDF file not found at {PDF_PATH}")
        return
    
    try:
        # Create a mock UploadFile object
        from fastapi import UploadFile
        from io import BytesIO
        
        pdf_bytes = PDF_PATH.read_bytes()
        print(f"  - PDF size: {len(pdf_bytes)} bytes")
        
        # Create UploadFile mock
        class MockUploadFile:
            def __init__(self, filename, content):
                self.filename = filename
                self._content = content
            
            async def read(self):
                return self._content
        
        mock_file = MockUploadFile(
            filename=PDF_PATH.name,
            content=pdf_bytes
        )
        
        print(f"  - Starting ingestion into '{TEST_COLLECTION_NAME}'...")
        result = await service.ingest_pdfs(
            collection_name=TEST_COLLECTION_NAME,
            files=[mock_file]
        )
        
        print(f"✓ Ingestion complete!")
        print(f"  - Files processed: {result['files_processed']}")
        print(f"  - Chunks created: {result['chunks_created']}")
        print(f"  - Message: {result['message']}")
        
    except Exception as e:
        print(f"✗ PDF ingestion failed: {e}")
        import traceback
        traceback.print_exc()
        return
    
    # Test 6: Verify vectors were added
    print(f"\n[TEST 6] Verifying vectors were added to collection...")
    try:
        collections = await service.list_collections()
        test_col = next((c for c in collections if c['name'] == TEST_COLLECTION_NAME), None)
        
        if test_col:
            print(f"✓ Collection '{TEST_COLLECTION_NAME}' now has {test_col['vectors_count']} vectors")
            if test_col['vectors_count'] > 0:
                print(f"  - PDF successfully ingested and embedded!")
            else:
                print(f"  - WARNING: No vectors found. Ingestion may have failed.")
        else:
            print(f"✗ Collection not found in list!")
    except Exception as e:
        print(f"✗ Verification failed: {e}")
    
    # Test 7: Try to create duplicate collection (should handle gracefully)
    print(f"\n[TEST 7] Testing duplicate collection creation...")
    try:
        result = await service.create_collection(TEST_COLLECTION_NAME)
        print(f"✓ {result['message']}")
    except Exception as e:
        print(f"✗ Unexpected error: {e}")
    
    # Test 8: Test chunking function directly
    print(f"\n[TEST 8] Testing text chunking...")
    try:
        sample_text = "This is a test. " * 100  # Create text larger than chunk size
        chunks = service._chunk_text(sample_text)
        print(f"✓ Created {len(chunks)} chunks from {len(sample_text)} characters")
        print(f"  - Chunk size setting: {service.chunk_size}")
        print(f"  - Chunk overlap setting: {service.chunk_overlap}")
        if chunks:
            print(f"  - First chunk length: {len(chunks[0])}")
            print(f"  - Last chunk length: {len(chunks[-1])}")
    except Exception as e:
        print(f"✗ Chunking test failed: {e}")
    
    print("\n" + "=" * 80)
    print("ALL TESTS COMPLETED!")
    print("=" * 80)
    
    # Optional cleanup
    print(f"\nNOTE: Test collection '{TEST_COLLECTION_NAME}' was left in place.")
    print(f"To delete it, uncomment the cleanup section in the script.")
    
    # Uncomment to auto-cleanup:
    # print(f"\n[CLEANUP] Deleting test collection...")
    # try:
    #     result = await service.delete_collection(TEST_COLLECTION_NAME)
    #     print(f"✓ {result['message']}")
    # except Exception as e:
    #     print(f"✗ Cleanup failed: {e}")
    
    # Close async client connection
    print("\n[CLEANUP] Closing async client connection...")
    try:
        await service.client.close()
        print("✓ Connection closed")
    except Exception as e:
        print(f"✗ Failed to close connection: {e}")


if __name__ == "__main__":
    print("Running manual tests for QdrantAdminService...\n")
    asyncio.run(test_admin_service())
