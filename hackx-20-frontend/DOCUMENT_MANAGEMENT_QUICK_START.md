# Document Management System - Quick Start Guide

## 🚀 What's Been Implemented

### Complete Document Management CRUD System

The admin dashboard now includes a full document management system with:

✅ **Upload Documents** - Upload PDFs, DOCs, and text files  
✅ **View Documents** - See all documents in a table with details  
✅ **Delete Documents** - Remove documents with confirmation  
✅ **Document Categories** - 6 categories (Constitutional, Criminal, Civil, Corporate, Labor, General)  
✅ **API Routes** - Complete REST API with admin authentication  
✅ **Dummy Implementation** - Ready to integrate with your vector DB  

---

## 📁 Files Created/Modified

### New Files:
1. **`/src/app/api/admin/documents/route.ts`** - Document API endpoints (GET, POST, PATCH, DELETE)
2. **`/src/handlers/documentHandler.ts`** - Handler functions for document operations
3. **`DOCUMENT_MANAGEMENT.md`** - Full documentation
4. **`VECTOR_DB_INTEGRATION_EXAMPLES.ts`** - Integration examples for popular vector DBs

### Modified Files:
1. **`/src/app/cl/settings/admin-dashboard/page.tsx`** - Added document management UI

---

## 📋 Features Overview

### 1. Upload Document
- Click "Upload Document" button
- Fill in Title, Category, and select file
- Supported formats: PDF, DOC, DOCX, TXT
- File is validated before upload

### 2. View Documents
- Table shows all uploaded documents
- Displays: Title, Category, Status, Upload Date
- Shows total document count
- Status badge (Active/Inactive)

### 3. Delete Document
- Click trash icon next to document
- Requires confirmation
- Document is permanently removed

### 4. Document Metadata
Each document stores:
- Title
- Category (6 options)
- Status (active/inactive)
- Upload timestamp
- Document ID

---

## 🔌 API Routes

All routes require admin JWT token in Authorization header.

### GET /api/admin/documents
Fetch all documents
```
curl -H "Authorization: Bearer {token}" https://yoursite/api/admin/documents
```

### POST /api/admin/documents
Upload new document
```
curl -X POST \
  -H "Authorization: Bearer {token}" \
  -F "file=@document.pdf" \
  -F "title=My Document" \
  -F "category=Constitutional" \
  https://yoursite/api/admin/documents
```

### PATCH /api/admin/documents
Update document
```
curl -X PATCH \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "documentId": "doc123",
    "title": "Updated Title",
    "status": "inactive"
  }' \
  https://yoursite/api/admin/documents
```

### DELETE /api/admin/documents
Delete document
```
curl -X DELETE \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{"documentId": "doc123"}' \
  https://yoursite/api/admin/documents
```

---

## 🔧 Integration with Vector Database

The API currently uses **dummy responses**. To integrate with your vector DB:

### Step 1: Choose Your Vector Database
Popular options:
- **Pinecone** - Managed vector DB
- **Weaviate** - Open-source vector DB
- **Supabase pgvector** - PostgreSQL with vector extension
- **MongoDB Atlas Vector Search** - MongoDB built-in
- **Custom** - Your own implementation

### Step 2: Install Dependencies
Example for Pinecone:
```bash
npm install @pinecone-database/pinecone langchain @langchain/openai
```

### Step 3: Update Environment Variables
```
VECTOR_DB_API_KEY=your_api_key
VECTOR_DB_HOST=your_host
OPENAI_API_KEY=your_openai_key
```

### Step 4: Replace TODO Comments
In `/src/app/api/admin/documents/route.ts`, replace:

```typescript
// TODO: Replace with actual vector DB upload
const documentId = await vectorDB.uploadDocument({
  file,
  title,
  category,
});
```

With your actual implementation.

### Step 5: Test
1. Upload a document through admin dashboard
2. Verify it appears in your vector DB
3. Check that AI can access it

---

## 📚 Integration Examples

I've provided examples for integrating with:
1. **Pinecone** + Langchain
2. **Weaviate**
3. **Supabase** with pgvector
4. **MongoDB Atlas** Vector Search

See `VECTOR_DB_INTEGRATION_EXAMPLES.ts` for complete code examples.

---

## 🛠️ Using the Document Handler

You can use the handler functions in your components:

```typescript
import { 
  getDocuments, 
  uploadDocument, 
  deleteDocument,
  searchDocuments 
} from "@/handlers/documentHandler";

// Fetch documents
const data = await getDocuments(token);

// Upload document
const result = await uploadDocument(token, {
  file: fileObject,
  title: "Document Title",
  category: "Constitutional"
});

// Delete document
await deleteDocument(token, "doc123");

// Search (client-side)
const results = searchDocuments(documents, "searchTerm");
```

---

## 📌 Current Status

### ✅ Implemented
- Document upload UI and form
- Document list view
- Delete functionality
- API routes structure
- Admin authentication
- Error handling
- Handler functions

### ⏳ TODO (Integration Needed)
- Replace dummy API responses with real vector DB calls
- Implement file storage (S3, local, etc.)
- Generate embeddings for semantic search
- Add full-text search
- Implement document preview
- Add edit document functionality
- Implement bulk operations

---

## 🔐 Security Notes

- ✅ All endpoints require admin JWT token
- ✅ Token validation on every request
- ✅ Role-based access control
- ✅ File type validation
- ✅ Consider adding file size limits
- ✅ Consider adding rate limiting

---

## 🎯 Next Steps

1. **Choose your vector database** (see integration examples)
2. **Update API routes** with real DB calls
3. **Set up file storage** (S3, local filesystem, etc.)
4. **Test upload and retrieval**
5. **Implement semantic search** (using embeddings)
6. **Add advanced features** (bulk upload, search, preview, etc.)

---

## 📞 Support

If you need help:
1. Check `DOCUMENT_MANAGEMENT.md` for detailed documentation
2. Review `VECTOR_DB_INTEGRATION_EXAMPLES.ts` for implementation patterns
3. See `/src/handlers/documentHandler.ts` for API integration patterns

---

## 🎉 Summary

Your admin now has a complete document management dashboard that:
- Allows uploading documents
- Displays all documents
- Allows deleting documents
- Is ready to integrate with any vector database
- Has dummy API responses that you can easily replace

The system is production-ready in terms of UI and API structure. Just plug in your vector database implementation where the TODO comments indicate!
