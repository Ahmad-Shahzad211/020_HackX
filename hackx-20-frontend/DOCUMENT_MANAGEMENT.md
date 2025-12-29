# Document Management System - Admin Dashboard

## Overview
The admin dashboard now includes a complete document management system for uploading, viewing, and deleting documents in your vector database for the AI.

## Features

### 1. **Upload Documents**
- Click "Upload Document" button in the Document Management section
- Fill in:
  - **Title**: Name of the document
  - **Category**: Type of document (Constitutional, Criminal, Civil, Corporate, Labor, General)
  - **File**: Upload PDF, DOC, DOCX, or TXT files
- Documents are uploaded to the vector database

### 2. **View Documents**
- See all uploaded documents in a table format
- Shows: Title, Category, Status, Upload Date
- Shows document count and status indicator

### 3. **Delete Documents**
- Click the delete icon (trash) next to any document
- Requires confirmation
- Permanently removes document from vector database

### 4. **Document Status**
- **Active**: Document is available for AI to use
- **Inactive**: Document is stored but not used by AI (for future use)

## File Structure

```
/src
├── /api/admin/documents
│   └── route.ts              # API endpoints for document CRUD
├── /handlers
│   └── documentHandler.ts    # Handler functions for document operations
├── /settings/admin-dashboard
│   └── page.tsx              # Admin dashboard page with document management UI
```

## API Routes

### Get All Documents
```
GET /api/admin/documents
Headers: Authorization: Bearer {token}
Response: { documents: [], totalDocuments: 0, status: 200 }
```

### Upload Document
```
POST /api/admin/documents
Headers: Authorization: Bearer {token}
Body: FormData {
  file: File,
  title: string,
  category: string
}
Response: { documentId: string, document: Document, status: 200 }
```

### Update Document
```
PATCH /api/admin/documents
Headers: Authorization: Bearer {token}
Body: {
  documentId: string,
  title?: string,
  category?: string,
  status?: 'active' | 'inactive'
}
Response: { document: Document, status: 200 }
```

### Delete Document
```
DELETE /api/admin/documents
Headers: Authorization: Bearer {token}
Body: { documentId: string }
Response: { status: 200 }
```

## Integration with Vector Database

The API route file (`/src/app/api/admin/documents/route.ts`) contains TODO comments showing where to integrate your actual vector database:

### For GET (fetch documents):
```typescript
// TODO: Replace with actual vector DB query
// const documents = await vectorDB.getAllDocuments();
```

### For POST (upload documents):
```typescript
// TODO: Replace with actual vector DB upload
// const documentId = await vectorDB.uploadDocument({
//   file,
//   title,
//   category,
//   uploadedBy: admin.id
// });
```

### For PATCH (update documents):
```typescript
// TODO: Replace with actual vector DB update
// const updatedDoc = await vectorDB.updateDocument(documentId, {
//   title,
//   category,
//   status
// });
```

### For DELETE (delete documents):
```typescript
// TODO: Replace with actual vector DB delete
// await vectorDB.deleteDocument(documentId);
```

## Using the Document Handler

You can also use the `documentHandler.ts` file in your components:

```typescript
import { 
  getDocuments, 
  uploadDocument, 
  updateDocument, 
  deleteDocument,
  searchDocuments 
} from "@/handlers/documentHandler";

// Get all documents
const data = await getDocuments(token);

// Upload a document
const uploadResult = await uploadDocument(token, {
  file: fileObject,
  title: "Document Title",
  category: "Constitutional"
});

// Update a document
const updateResult = await updateDocument(token, {
  documentId: "doc123",
  status: "inactive"
});

// Delete a document
const deleteResult = await deleteDocument(token, "doc123");

// Search documents (client-side)
const results = searchDocuments(documents, "law");
```

## Document Categories

The following categories are available:
- **General** - Default/miscellaneous documents
- **Constitutional** - Constitutional law and amendments
- **Criminal** - Criminal law and procedures
- **Civil** - Civil law and procedures
- **Corporate** - Corporate and business law
- **Labor** - Labor and employment law

## Security

- ✅ All document operations require admin JWT token
- ✅ Token is validated on every request
- ✅ Non-admins cannot access document endpoints
- ✅ File uploads are validated

## Next Steps

1. **Integrate with Vector Database**:
   - Replace TODO comments in `/src/app/api/admin/documents/route.ts`
   - Implement actual file storage (S3, local storage, etc.)
   - Implement vector embedding and search

2. **Add Document Search** (Server-side):
   - Implement full-text search in the API
   - Add semantic search using embeddings

3. **Implement Edit Functionality**:
   - Currently shows placeholder "Edit" button
   - Can be used to update document metadata

4. **Add Document Preview**:
   - Show document content preview
   - Support different file types

5. **Implement Bulk Operations**:
   - Bulk upload multiple documents
   - Bulk delete documents
   - Bulk update status

## Testing

To test the document management system:

1. Login as admin
2. Go to Admin Dashboard
3. Click "Upload Document"
4. Fill in the form and upload
5. Check if document appears in the list
6. Try deleting a document (with confirmation)

**Note**: Currently the API returns dummy data. Once you integrate with your vector database, real data will be stored and retrieved.
