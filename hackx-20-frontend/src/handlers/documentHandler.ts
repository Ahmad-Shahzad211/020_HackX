/**
 * Document Management Handler
 * 
 * This handler provides functions to interact with the admin documents API.
 * Replace the TODO comments with your actual vector DB implementation.
 */

interface UploadDocumentParams {
  file: File;
  title: string;
  category: string;
}

interface UpdateDocumentParams {
  documentId: string;
  title?: string;
  category?: string;
  status?: string;
}

interface DeleteDocumentParams {
  documentId: string;
}

/**
 * Fetch all documents from the vector database
 */
export const getDocuments = async (token: string) => {
  try {
    const response = await fetch("/api/admin/documents", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();
    return data;
  } catch (error: any) {
    return {
      message: `Error fetching documents: ${error.message}`,
      status: 500,
    };
  }
};

/**
 * Upload a new document to the vector database
 * @param token - JWT token for authentication
 * @param params - Document upload parameters (file, title, category)
 */
export const uploadDocument = async (token: string, params: UploadDocumentParams) => {
  try {
    const formData = new FormData();
    formData.append("file", params.file);
    formData.append("title", params.title);
    formData.append("category", params.category);

    const response = await fetch("/api/admin/documents", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    const data = await response.json();
    return data;
  } catch (error: any) {
    return {
      message: `Error uploading document: ${error.message}`,
      status: 500,
    };
  }
};

/**
 * Update a document in the vector database
 * @param token - JWT token for authentication
 * @param params - Document update parameters
 */
export const updateDocument = async (token: string, params: UpdateDocumentParams) => {
  try {
    const response = await fetch("/api/admin/documents", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        documentId: params.documentId,
        title: params.title,
        category: params.category,
        status: params.status,
      }),
    });

    const data = await response.json();
    return data;
  } catch (error: any) {
    return {
      message: `Error updating document: ${error.message}`,
      status: 500,
    };
  }
};

/**
 * Delete a document from the vector database
 * @param token - JWT token for authentication
 * @param documentId - ID of the document to delete
 */
export const deleteDocument = async (token: string, documentId: string) => {
  try {
    const response = await fetch("/api/admin/documents", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ documentId }),
    });

    const data = await response.json();
    return data;
  } catch (error: any) {
    return {
      message: `Error deleting document: ${error.message}`,
      status: 500,
    };
  }
};

/**
 * Search documents by title or category
 * Note: This is implemented client-side. Implement on backend if needed for large datasets.
 */
export const searchDocuments = (
  documents: any[],
  searchTerm: string
) => {
  if (!searchTerm.trim()) return documents;

  return documents.filter(
    (doc) =>
      doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.category.toLowerCase().includes(searchTerm.toLowerCase())
  );
};
