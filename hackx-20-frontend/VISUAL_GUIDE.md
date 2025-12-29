# Document Management System - Visual Guide

## 📱 User Interface Flow

```
┌─────────────────────────────────────┐
│  Admin Dashboard                    │
├─────────────────────────────────────┤
│                                     │
│  Stats Cards:                       │
│  ┌──────────┐ ┌──────────┐         │
│  │ 25 Users │ │ 5 Admins │ ...     │
│  └──────────┘ └──────────┘         │
│                                     │
│  User Management Section            │
│  (Users table with search)          │
│                                     │
│  ─────────────────────────────      │
│                                     │
│  Document Management                │
│  ┌────────────────────────────────┐ │
│  │ [Upload Document] ▼            │ │
│  └────────────────────────────────┘ │
│                                     │
│  Documents Table:                   │
│  ┌─────────────────────────────────┐│
│  │ Title | Category | Status | ... ││
│  ├─────────────────────────────────┤│
│  │ Doc 1 | Const   | active | [✏️🗑️]││
│  │ Doc 2 | Criminal| active | [✏️🗑️]││
│  └─────────────────────────────────┘│
│                                     │
└─────────────────────────────────────┘
```

## 📤 Upload Modal

```
┌──────────────────────────────────┐
│ Upload Document                ✕ │
├──────────────────────────────────┤
│                                  │
│  Title                           │
│  [________________________]       │
│                                  │
│  Category                        │
│  [General ▼]                     │
│  - General                       │
│  - Constitutional                │
│  - Criminal                      │
│  - Civil                         │
│  - Corporate                     │
│  - Labor                         │
│                                  │
│  File                            │
│  ┌──────────────────────────┐   │
│  │ 📁 Click to upload       │   │
│  │    or drag and drop      │   │
│  │    PDF, DOC, DOCX, TXT   │   │
│  └──────────────────────────┘   │
│                                  │
│  [Upload] [Cancel]              │
│                                  │
└──────────────────────────────────┘
```

## 🔄 Data Flow

```
User Action → Frontend → API Route → Vector DB → Response
   ↓              ↓          ↓          ↓          ↓
Upload Doc → Form Submit → POST → Store in DB → Return ID
   ↓              ↓          ↓          ↓          ↓
View Docs → Table Load → GET → Fetch from DB → Display
   ↓              ↓          ↓          ↓          ↓
Delete Doc → Confirm → DELETE → Remove from DB → Refresh
   ↓              ↓          ↓          ↓          ↓
Edit Doc → Form Update → PATCH → Update in DB → Confirm
```

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│ Frontend                                                 │
├─────────────────────────────────────────────────────────┤
│                                                          │
│ Admin Dashboard (page.tsx)                              │
│ ├── User Management Section                             │
│ │   ├── User Table                                      │
│ │   ├── Search/Filter                                   │
│ │   └── Action Buttons (Delete, Toggle Role)            │
│ │                                                        │
│ └── Document Management Section                         │
│     ├── Upload Modal                                    │
│     ├── Document Table                                  │
│     ├── Search/Filter                                   │
│     └── Action Buttons (Edit, Delete)                   │
│                                                          │
└─────────────────────────────────────────────────────────┘
         ↓ HTTP Requests (with JWT token)
┌─────────────────────────────────────────────────────────┐
│ API Routes (/src/app/api/admin/)                        │
├─────────────────────────────────────────────────────────┤
│                                                          │
│ /users/route.ts                                         │
│ ├── GET → Fetch all users                              │
│ ├── POST → Create user (if needed)                     │
│ ├── PATCH → Update user role                           │
│ └── DELETE → Delete user                               │
│                                                          │
│ /documents/route.ts  ← YOUR FOCUS                       │
│ ├── GET → Fetch documents from vector DB              │
│ ├── POST → Upload document to vector DB                │
│ ├── PATCH → Update document metadata                   │
│ └── DELETE → Delete document from vector DB            │
│                                                          │
│ /analytics/route.ts                                     │
│ └── GET → Fetch analytics data                         │
│                                                          │
└─────────────────────────────────────────────────────────┘
         ↓ Database Calls (TO IMPLEMENT)
┌─────────────────────────────────────────────────────────┐
│ Vector Database (Your Choice)                           │
├─────────────────────────────────────────────────────────┤
│                                                          │
│ Options:                                                 │
│ ├── Pinecone (Recommended for beginners)               │
│ ├── Weaviate (Open source)                             │
│ ├── Supabase pgvector (PostgreSQL based)               │
│ ├── MongoDB Atlas Vector Search (NoSQL)                │
│ └── Custom (Your own implementation)                    │
│                                                          │
│ Stores:                                                  │
│ └── documents[] → { id, title, category, embedding,    │
│                     status, uploadedAt, content }       │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

## 🔐 Authentication Flow

```
┌─────────────────────────────────────┐
│ Login Page                          │
├─────────────────────────────────────┤
│ Email: [admin@gmail.com       ]     │
│ Password: [            ]            │
│ ☑️ Login as Admin                   │
│ [Login]                             │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│ Backend Validation                  │
├─────────────────────────────────────┤
│ 1. Find user by email              │
│ 2. Verify password                  │
│ 3. Check if admin login requested  │
│ 4. If yes, verify role == "admin"  │
│ 5. Generate JWT with role          │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│ Frontend Storage                    │
├─────────────────────────────────────┤
│ Zustand Store:                      │
│ - userName: "Admin-CL"              │
│ - userRole: "admin"                 │
│ - userEmail: "admin@gmail.com"      │
│                                     │
│ Cookies/LocalStorage:               │
│ - __chatLegis__: JWT token         │
│ - token: JWT token                  │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│ Access Dashboard                    │
├─────────────────────────────────────┤
│ IF userRole == "admin" THEN         │
│   ✅ Show Dashboard link in sidebar │
│   ✅ Allow access to /admin-dash... │
│ ELSE                                │
│   ❌ Redirect to /chatscreen        │
│   ❌ Hide Dashboard                 │
└─────────────────────────────────────┘
```

## 📊 Database Schema

### Documents Collection
```
{
  _id: ObjectId,
  title: String,           // "Pakistan Constitutional Law"
  category: String,        // "Constitutional" | "Criminal" | etc
  content: String,         // Full document text
  embedding: Vector,       // [0.12, 0.34, ...] (embeddings for search)
  status: String,          // "active" | "inactive"
  uploadedBy: String,      // Admin user ID
  uploadedAt: Date,        // 2025-12-29T10:00:00Z
  updatedAt: Date,         // Last update timestamp
  fileSize: Number,        // In bytes
  fileType: String,        // "pdf" | "doc" | "docx" | "txt"
}
```

## 🔑 Key Integration Points

### WHERE YOU NEED TO ADD CODE:

```
/src/app/api/admin/documents/route.ts

Line ~20:  GET request
           Replace: // TODO: Replace with actual vector DB query
           With:    const documents = await yourDB.getAll();

Line ~70:  POST request
           Replace: // TODO: Replace with actual vector DB upload
           With:    const id = await yourDB.upload(file, title, category);

Line ~120: PATCH request
           Replace: // TODO: Replace with actual vector DB update
           With:    await yourDB.update(documentId, updates);

Line ~160: DELETE request
           Replace: // TODO: Replace with actual vector DB delete
           With:    await yourDB.delete(documentId);
```

## 🎯 Implementation Priority

### Phase 1: Basic Setup (Required)
- [ ] Choose vector database
- [ ] Install dependencies
- [ ] Set up environment variables
- [ ] Implement GET (retrieve documents)
- [ ] Implement POST (upload documents)

### Phase 2: Core Features (Important)
- [ ] Implement DELETE (remove documents)
- [ ] Test all CRUD operations
- [ ] Add error handling
- [ ] Add logging

### Phase 3: Advanced Features (Optional)
- [ ] Implement PATCH (update documents)
- [ ] Add semantic search
- [ ] Add document preview
- [ ] Add bulk operations

## 📋 Testing Checklist

### Manual Testing Steps:

1. **Upload Test**
   - [ ] Login as admin
   - [ ] Go to dashboard
   - [ ] Click "Upload Document"
   - [ ] Fill form and select file
   - [ ] Click upload
   - [ ] Document appears in table
   - [ ] Document is in your vector DB

2. **Retrieve Test**
   - [ ] Refresh page
   - [ ] Documents still appear
   - [ ] All fields are correct

3. **Delete Test**
   - [ ] Click delete on a document
   - [ ] Confirm deletion
   - [ ] Document disappears from table
   - [ ] Document removed from vector DB

4. **Error Handling**
   - [ ] Try uploading without title
   - [ ] Try uploading without file
   - [ ] Try uploading wrong file type
   - [ ] Proper error messages appear

## 🎓 Code Organization

```
Frontend Logic:
- /src/app/cl/settings/admin-dashboard/page.tsx
  Contains: UI rendering, state management, user interactions

API Layer:
- /src/app/api/admin/documents/route.ts
  Contains: Route handlers, validation, DB calls

Handler Functions:
- /src/handlers/documentHandler.ts
  Contains: Reusable API call functions

Types:
- /src/types/index.ts
  Contains: TypeScript interfaces

Utilities:
- /src/utils/clientUtils.ts
  Contains: Helper functions
```

## 🚀 Quick Start Command

After choosing your vector DB, run:

```bash
# 1. Install dependencies (example for Pinecone)
npm install @pinecone-database/pinecone langchain @langchain/openai

# 2. Add environment variables to .env.local
PINECONE_API_KEY=xxx
PINECONE_INDEX_NAME=xxx
OPENAI_API_KEY=xxx

# 3. Update /src/app/api/admin/documents/route.ts
# (Replace TODO comments with your DB calls)

# 4. Test
npm run dev
# Navigate to admin dashboard and try uploading
```

---

This visual guide should help you understand the complete flow and where your integration points are!
