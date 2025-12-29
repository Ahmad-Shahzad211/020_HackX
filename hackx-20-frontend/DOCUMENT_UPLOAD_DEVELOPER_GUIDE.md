# Document Upload System - Developer Guide

## Overview
This guide explains the complete document management system flow, from frontend upload to backend storage. The system is designed to allow admins to upload legal documents that will be stored in a vector database for AI-powered semantic search.

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         FRONTEND                             │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Admin Dashboard (Upload UI)                           │ │
│  │  /src/app/cl/settings/admin-dashboard/page.tsx         │ │
│  └─────────────────────┬──────────────────────────────────┘ │
│                        │                                     │
│                        ▼                                     │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Document Handler (API Calls)                          │ │
│  │  /src/handlers/documentHandler.ts                      │ │
│  └─────────────────────┬──────────────────────────────────┘ │
└────────────────────────┼────────────────────────────────────┘
                         │
                         ▼ HTTP POST with FormData
┌─────────────────────────────────────────────────────────────┐
│                         BACKEND                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Document API Route                                    │ │
│  │  /src/app/api/admin/documents/route.ts                │ │
│  │  - Admin authentication                                │ │
│  │  - File handling                                       │ │
│  │  - Vector DB operations (TODO)                         │ │
│  └─────────────────────┬──────────────────────────────────┘ │
│                        │                                     │
│                        ▼                                     │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Vector Database (NOT YET IMPLEMENTED)                 │ │
│  │  - Store document content                              │ │
│  │  - Generate embeddings                                 │ │
│  │  - Enable semantic search                              │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

---

## Current Implementation Status

### ✅ COMPLETE: Frontend UI
- Upload modal with file picker
- Form fields: title, category, file
- Document table with search/filter
- Delete confirmation
- Loading states and error handling

### ✅ COMPLETE: API Structure
- POST endpoint for uploads
- GET endpoint for retrieving documents
- PATCH endpoint for updates
- DELETE endpoint for removal
- Admin authentication middleware

### ⏳ TODO: Vector Database Integration
- File storage (S3/local/vector DB)
- Embedding generation
- Vector database CRUD operations
- Semantic search implementation

---

## Document Upload Flow (Step by Step)

### 1. User Interaction (Frontend)
**File**: `src/app/cl/settings/admin-dashboard/page.tsx`

User clicks "Upload New Document" button:
```typescript
const [showUploadModal, setShowUploadModal] = useState(false);
const [docTitle, setDocTitle] = useState("");
const [docCategory, setDocCategory] = useState("Constitution");
const [uploadFile, setUploadFile] = useState<File | null>(null);

// Button handler
onClick={() => setShowUploadModal(true)}
```

### 2. Form Submission (Frontend)
User fills form and submits:
```typescript
const handleUploadDocument = async (e: React.FormEvent) => {
  e.preventDefault();
  
  if (!uploadFile || !docTitle) {
    alert("Please fill all fields");
    return;
  }

  setUploading(true);

  try {
    // Call API handler
    const result = await uploadDocument(
      uploadFile,
      docTitle,
      docCategory,
      token
    );

    if (result.success) {
      fetchDocuments(); // Refresh the list
      setShowUploadModal(false);
      // Reset form
      setDocTitle("");
      setDocCategory("Constitution");
      setUploadFile(null);
    }
  } catch (error) {
    console.error("Upload failed:", error);
  } finally {
    setUploading(false);
  }
};
```

### 3. API Handler (Frontend)
**File**: `src/handlers/documentHandler.ts`

Constructs FormData and sends to backend:
```typescript
export const uploadDocument = async (
  file: File,
  title: string,
  category: string,
  token: string
) => {
  try {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("title", title);
    formData.append("category", category);

    const response = await fetch("/api/admin/documents", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        // Note: Don't set Content-Type for FormData
      },
      body: formData,
    });

    const data = await response.json();
    return { success: response.ok, data };
  } catch (error) {
    return { 
      success: false, 
      error: "Upload failed" 
    };
  }
};
```

### 4. Backend API Route (Backend)
**File**: `src/app/api/admin/documents/route.ts`

Receives request and processes:
```typescript
export async function POST(request: NextRequest) {
  // Step 1: Verify admin authentication
  const user = await verifyAdmin(request);
  if (!user) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 403 }
    );
  }

  try {
    // Step 2: Parse form data
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const title = formData.get("title") as string;
    const category = formData.get("category") as string;

    // Step 3: Validate inputs
    if (!file || !title || !category) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Step 4: TODO - REPLACE THIS WITH VECTOR DB UPLOAD
    // Current: Dummy implementation
    const documentId = `doc_${Date.now()}`;
    
    // TODO: Implement actual vector DB operations:
    // 1. Extract text from file (PDF, DOCX, etc.)
    // 2. Generate embeddings using OpenAI/similar
    // 3. Store in vector database (Pinecone/Weaviate/etc.)
    // 4. Store metadata in regular database
    
    // Step 5: Return success response
    return NextResponse.json({
      success: true,
      message: "Document uploaded successfully",
      document: {
        id: documentId,
        title,
        category,
        status: "active",
        uploadDate: new Date().toISOString(),
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Upload failed" },
      { status: 500 }
    );
  }
}
```

---

## File Structure

```
src/
├── app/
│   ├── api/
│   │   └── admin/
│   │       └── documents/
│   │           └── route.ts          ← Backend API endpoint
│   └── cl/
│       └── settings/
│           └── admin-dashboard/
│               └── page.tsx          ← Admin UI with upload modal
│
├── handlers/
│   └── documentHandler.ts            ← Frontend API calls
│
└── types/
    └── index.ts                       ← TypeScript interfaces
```

---

## Key Code Locations

### Upload Modal UI
**File**: `src/app/cl/settings/admin-dashboard/page.tsx`  
**Lines**: ~150-250

```typescript
{showUploadModal && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <div className="bg-white rounded-xl p-6 max-w-md w-full">
      <h3 className="text-xl font-bold mb-4">Upload New Document</h3>
      <form onSubmit={handleUploadDocument}>
        {/* Title input */}
        <input
          type="text"
          value={docTitle}
          onChange={(e) => setDocTitle(e.target.value)}
          placeholder="Document Title"
        />
        
        {/* Category dropdown */}
        <select
          value={docCategory}
          onChange={(e) => setDocCategory(e.target.value)}
        >
          <option>Constitution</option>
          <option>Criminal Law</option>
          {/* ... more categories */}
        </select>
        
        {/* File picker */}
        <input
          type="file"
          onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
          accept=".pdf,.doc,.docx,.txt"
        />
        
        {/* Submit button */}
        <button type="submit">
          {uploading ? "Uploading..." : "Upload Document"}
        </button>
      </form>
    </div>
  </div>
)}
```

### API Handler Functions
**File**: `src/handlers/documentHandler.ts`  
**Lines**: 20-50

All document operations:
- `getDocuments()` - Fetch all documents
- `uploadDocument()` - Upload new document
- `updateDocument()` - Update document metadata
- `deleteDocument()` - Delete document
- `searchDocuments()` - Search by title/category

### Backend API Endpoint
**File**: `src/app/api/admin/documents/route.ts`  
**Critical Lines with TODOs**:
- Line ~70: POST - Upload implementation
- Line ~20: GET - Retrieval implementation
- Line ~120: PATCH - Update implementation
- Line ~160: DELETE - Deletion implementation

---

## Data Models

### Document Interface
```typescript
interface Document {
  id: string;              // Unique identifier
  title: string;           // Document title
  category: string;        // Legal category
  status: "active" | "inactive";
  uploadDate: string;      // ISO date string
  fileUrl?: string;        // S3/storage URL
  content?: string;        // Extracted text
  embeddings?: number[];   // Vector embeddings
}
```

### Upload Request
```typescript
// FormData structure
{
  file: File,              // The actual file
  title: string,           // Document title
  category: string,        // One of 6 categories
}
```

### Upload Response
```typescript
{
  success: boolean,
  message: string,
  document: {
    id: string,
    title: string,
    category: string,
    status: string,
    uploadDate: string,
  }
}
```

---

## Categories Available

The system supports 6 legal document categories:
1. **Constitution** - Constitutional law documents
2. **Criminal Law** - Criminal code and procedures
3. **Civil Law** - Civil litigation and procedures
4. **Tax Law** - Tax regulations and codes
5. **Labor Law** - Employment and labor regulations
6. **Corporate Law** - Business and corporate regulations

---

## Authentication & Security

### Admin Verification
**File**: `src/app/api/admin/documents/route.ts`  
**Function**: `verifyAdmin()`

Every request is checked:
```typescript
const verifyAdmin = async (request: NextRequest) => {
  const authHeader = request.headers.get("authorization");
  
  if (!authHeader?.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.substring(7);
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    
    if (decoded.role !== "admin") {
      return null; // Not an admin
    }
    
    return decoded; // Valid admin user
  } catch (error) {
    return null; // Invalid token
  }
};
```

### JWT Token Structure
```typescript
{
  id: string,       // User ID
  email: string,    // User email
  username: string, // User name
  role: "admin",    // Must be "admin"
  iat: number,      // Issued at
  exp: number,      // Expires at
}
```

---

## Vector Database Integration (TODO)

### What Needs to be Implemented

#### 1. File Processing
```typescript
// Extract text from uploaded file
const extractText = async (file: File) => {
  // For PDF: Use pdf-parse or similar
  // For DOCX: Use mammoth or docx
  // For TXT: Direct read
  return extractedText;
};
```

#### 2. Generate Embeddings
```typescript
// Use OpenAI or similar to create vector embeddings
const generateEmbeddings = async (text: string) => {
  const response = await openai.embeddings.create({
    model: "text-embedding-ada-002",
    input: text,
  });
  return response.data[0].embedding;
};
```

#### 3. Store in Vector DB
```typescript
// Example with Pinecone
const storeInVectorDB = async (document: Document) => {
  await pinecone.upsert({
    vectors: [{
      id: document.id,
      values: document.embeddings,
      metadata: {
        title: document.title,
        category: document.category,
        content: document.content,
      }
    }]
  });
};
```

#### 4. Semantic Search
```typescript
// Search for relevant documents
const searchDocuments = async (query: string) => {
  const queryEmbedding = await generateEmbeddings(query);
  
  const results = await pinecone.query({
    vector: queryEmbedding,
    topK: 5,
    includeMetadata: true,
  });
  
  return results.matches;
};
```

---

## Testing the Current System

### 1. Login as Admin
```
Email: admin@gmail.com
Password: [your admin password]
✅ Toggle "Admin Login" checkbox
```

### 2. Access Admin Dashboard
```
Navigate to: /cl/settings/admin-dashboard
You should see: Document Management section
```

### 3. Upload a Document
```
1. Click "Upload New Document"
2. Fill in title: "Sample Constitution"
3. Select category: "Constitution"
4. Choose a file (PDF/DOC/TXT)
5. Click "Upload Document"
```

### 4. Current Behavior (Dummy)
```
✅ Form validates inputs
✅ Shows loading state
✅ Makes API call with FormData
✅ Returns dummy document with generated ID
✅ Document appears in table
❌ File is NOT actually stored
❌ Content is NOT extracted
❌ Embeddings are NOT generated
❌ No semantic search capability yet
```

---

## Integration Steps for AI Developer

### Step 1: Choose Vector Database
Options:
- **Pinecone** - Managed, easy to use
- **Weaviate** - Open source, feature-rich
- **Supabase pgvector** - PostgreSQL extension
- **MongoDB Atlas** - If using MongoDB
- **Custom solution** - Qdrant, Milvus, etc.

### Step 2: Install Dependencies
```bash
# For Pinecone
npm install @pinecone-database/pinecone

# For OpenAI embeddings
npm install openai

# For PDF parsing
npm install pdf-parse

# For DOCX parsing
npm install mammoth
```

### Step 3: Set Up Environment Variables
```env
# .env.local
PINECONE_API_KEY=your_api_key
PINECONE_ENVIRONMENT=your_environment
PINECONE_INDEX_NAME=legal-documents

OPENAI_API_KEY=your_openai_key
```

### Step 4: Implement File Upload
**Location**: `src/app/api/admin/documents/route.ts` - Line ~70

Replace the TODO comment with:
1. Extract text from file
2. Generate embeddings
3. Store in vector DB
4. Save metadata to MongoDB/PostgreSQL

### Step 5: Implement Document Retrieval
**Location**: `src/app/api/admin/documents/route.ts` - Line ~20

Replace the TODO comment with:
1. Query vector DB for all documents
2. Return with metadata

### Step 6: Test End-to-End
```
1. Upload a real legal document
2. Verify it's stored in vector DB
3. Verify embeddings are generated
4. Test semantic search in chatbot
5. Verify document appears in admin dashboard
```

---

## Example: Complete Upload Implementation

```typescript
// File: src/app/api/admin/documents/route.ts
import { Pinecone } from "@pinecone-database/pinecone";
import { OpenAI } from "openai";
import pdfParse from "pdf-parse";

const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY!,
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(request: NextRequest) {
  const user = await verifyAdmin(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const title = formData.get("title") as string;
    const category = formData.get("category") as string;

    if (!file || !title || !category) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Step 1: Extract text from file
    const buffer = Buffer.from(await file.arrayBuffer());
    const pdfData = await pdfParse(buffer);
    const content = pdfData.text;

    // Step 2: Generate embeddings
    const embeddingResponse = await openai.embeddings.create({
      model: "text-embedding-ada-002",
      input: content,
    });
    const embeddings = embeddingResponse.data[0].embedding;

    // Step 3: Store in Pinecone
    const documentId = `doc_${Date.now()}`;
    const index = pinecone.index(process.env.PINECONE_INDEX_NAME!);
    
    await index.upsert([{
      id: documentId,
      values: embeddings,
      metadata: {
        title,
        category,
        content: content.substring(0, 1000), // First 1000 chars
        uploadDate: new Date().toISOString(),
      }
    }]);

    // Step 4: Store metadata in MongoDB (optional)
    await Document.create({
      id: documentId,
      title,
      category,
      status: "active",
      uploadDate: new Date(),
    });

    return NextResponse.json({
      success: true,
      message: "Document uploaded successfully",
      document: {
        id: documentId,
        title,
        category,
        status: "active",
        uploadDate: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Upload failed" },
      { status: 500 }
    );
  }
}
```

---

## Common Issues & Solutions

### Issue 1: "File is undefined"
**Cause**: File not properly attached to FormData  
**Solution**: Check file input and FormData append

### Issue 2: "401 Unauthorized"
**Cause**: Token not included or expired  
**Solution**: Verify token is stored and passed in Authorization header

### Issue 3: "403 Forbidden"
**Cause**: User is not admin  
**Solution**: Verify user role is "admin" in JWT token

### Issue 4: "Embeddings generation failed"
**Cause**: OpenAI API key invalid or rate limit  
**Solution**: Check API key and billing status

### Issue 5: "Vector DB connection timeout"
**Cause**: Network issues or wrong credentials  
**Solution**: Verify API keys and network connectivity

---

## Performance Considerations

### File Size Limits
```typescript
// Recommended limits
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = [".pdf", ".doc", ".docx", ".txt"];

// Implement validation
if (file.size > MAX_FILE_SIZE) {
  return NextResponse.json(
    { error: "File too large (max 10MB)" },
    { status: 400 }
  );
}
```

### Chunking Large Documents
```typescript
// Split large documents into chunks
const chunkText = (text: string, chunkSize = 1000) => {
  const chunks = [];
  for (let i = 0; i < text.length; i += chunkSize) {
    chunks.push(text.substring(i, i + chunkSize));
  }
  return chunks;
};

// Generate embeddings for each chunk
const chunks = chunkText(content);
const embeddingsPromises = chunks.map(chunk =>
  openai.embeddings.create({
    model: "text-embedding-ada-002",
    input: chunk,
  })
);
const embeddings = await Promise.all(embeddingsPromises);
```

---

## Summary

### ✅ What Works Now
- Complete admin UI for document management
- Upload modal with form validation
- Document table with search/filter
- API structure with authentication
- Error handling and loading states

### 🔧 What Needs Implementation
- File text extraction (PDF/DOCX)
- Embedding generation (OpenAI)
- Vector database storage (Pinecone/Weaviate)
- Semantic search in chatbot
- File storage (S3/local)

### 📁 Files to Modify
1. `src/app/api/admin/documents/route.ts` - Replace 4 TODO comments
2. Create vector DB client file (e.g., `src/db/vectorDB.ts`)
3. Add file parsing utilities (e.g., `src/utils/fileParser.ts`)
4. Update chatbot to use vector search

### ⏱️ Estimated Time
- Vector DB setup: 1-2 hours
- File parsing: 1-2 hours
- Embeddings integration: 1-2 hours
- Testing: 1-2 hours
- **Total**: 4-8 hours

---

## Quick Start Commands

```bash
# Install dependencies
npm install @pinecone-database/pinecone openai pdf-parse mammoth

# Set environment variables
echo "PINECONE_API_KEY=your_key" >> .env.local
echo "OPENAI_API_KEY=your_key" >> .env.local

# Run development server
npm run dev

# Test upload
# 1. Login as admin@gmail.com
# 2. Go to /cl/settings/admin-dashboard
# 3. Click "Upload New Document"
# 4. Fill form and submit
```

---

## Need Help?

### Reference Documentation
- Pinecone: https://docs.pinecone.io
- OpenAI Embeddings: https://platform.openai.com/docs/guides/embeddings
- PDF Parse: https://www.npmjs.com/package/pdf-parse
- Mammoth: https://www.npmjs.com/package/mammoth

### Code Examples
- See `VECTOR_DB_INTEGRATION_EXAMPLES.ts` for complete examples
- See `IMPLEMENTATION_CHECKLIST.ts` for step-by-step guide

---

**Ready to implement? Start with `src/app/api/admin/documents/route.ts` line 70!** 🚀
