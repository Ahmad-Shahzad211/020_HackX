import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

// Middleware to verify admin
function verifyAdmin(request: NextRequest) {
  const token = request.headers.get("authorization")?.split(" ")[1];

  if (!token) {
    return null;
  }

  try {
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET as string);
    if (decoded.role !== "admin") {
      return null;
    }
    return decoded;
  } catch (error) {
    return null;
  }
}

// GET - Get all documents from vector DB
export async function GET(request: NextRequest) {
  try {
    const admin = verifyAdmin(request);
    if (!admin) {
      return NextResponse.json(
        { message: "Unauthorized: Admin access required", status: 403 },
        { status: 403 }
      );
    }

    // TODO: Replace with actual vector DB query
    // const documents = await vectorDB.getAllDocuments();
    
    // Dummy response - update this with your vector DB implementation
    const documents = [
      {
        id: "doc1",
        title: "Pakistan Constitutional Law",
        category: "statutes",
        uploadedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        status: "active",
      },
      {
        id: "doc2",
        title: "Criminal Procedure Code",
        category: "synopsis",
        uploadedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        status: "active",
      },
      {
        id: "doc3",
        title: "Supreme Court Judgment 2024",
        category: "judgment",
        uploadedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        status: "active",
      },
      {
        id: "doc4",
        title: "Commercial Contract Template",
        category: "contract",
        uploadedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        status: "active",
      },
      {
        id: "doc5",
        title: "Legal Notice Draft Sample",
        category: "drafts",
        uploadedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        status: "active",
      },
      {
        id: "doc6",
        title: "Civil Suit Filing Guidelines",
        category: "suites",
        uploadedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
        status: "active",
      },
      {
        id: "doc7",
        title: "High Court Precedent Analysis",
        category: "judgment",
        uploadedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        status: "active",
      },
      {
        id: "doc8",
        title: "Pakistan Penal Code Amendments",
        category: "statutes",
        uploadedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
        status: "active",
      },
      {
        id: "doc9",
        title: "Employment Agreement Template",
        category: "contract",
        uploadedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
        status: "active",
      },
      {
        id: "doc10",
        title: "Case Brief: Constitutional Petition",
        category: "synopsis",
        uploadedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
        status: "active",
      },
      {
        id: "doc11",
        title: "Writ Petition Draft Format",
        category: "drafts",
        uploadedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
        status: "active",
      },
      {
        id: "doc12",
        title: "Divorce Suit Proceedings",
        category: "suites",
        uploadedAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
        status: "active",
      },
      {
        id: "doc13",
        title: "Landmark Judgment Collection 2023",
        category: "judgment",
        uploadedAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
        status: "active",
      },
      {
        id: "doc14",
        title: "Tax Laws Compilation",
        category: "statutes",
        uploadedAt: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString(),
        status: "active",
      },
      {
        id: "doc15",
        title: "Partnership Deed Sample",
        category: "contract",
        uploadedAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(),
        status: "active",
      },
    ];

    return NextResponse.json(
      {
        message: "Documents fetched successfully",
        documents,
        totalDocuments: documents.length,
        status: 200,
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        message: `An error occurred: ${error.message}`,
        status: 500,
      },
      { status: 500 }
    );
  }
}

// POST - Upload new document
export async function POST(request: NextRequest) {
  try {
    const admin = verifyAdmin(request);
    if (!admin) {
      return NextResponse.json(
        { message: "Unauthorized: Admin access required", status: 403 },
        { status: 403 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const title = formData.get("title") as string;
    const category = formData.get("category") as string;

    if (!file || !title || !category) {
      return NextResponse.json(
        { message: "File, title, and category are required", status: 400 },
        { status: 400 }
      );
    }

    // TODO: Replace with actual vector DB upload
    // const documentId = await vectorDB.uploadDocument({
    //   file,
    //   title,
    //   category,
    //   uploadedBy: admin.id
    // });

    // Dummy response - update this with your vector DB implementation
    const documentId = `doc_${Date.now()}`;

    return NextResponse.json(
      {
        message: "Document uploaded successfully",
        documentId,
        document: {
          id: documentId,
          title,
          category,
          uploadedAt: new Date().toISOString(),
          status: "active",
        },
        status: 200,
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        message: `An error occurred during upload: ${error.message}`,
        status: 500,
      },
      { status: 500 }
    );
  }
}

// PATCH - Update document
export async function PATCH(request: NextRequest) {
  try {
    const admin = verifyAdmin(request);
    if (!admin) {
      return NextResponse.json(
        { message: "Unauthorized: Admin access required", status: 403 },
        { status: 403 }
      );
    }

    const { documentId, title, category, status } = await request.json();

    if (!documentId) {
      return NextResponse.json(
        { message: "Document ID is required", status: 400 },
        { status: 400 }
      );
    }

    // TODO: Replace with actual vector DB update
    // const updatedDoc = await vectorDB.updateDocument(documentId, {
    //   title,
    //   category,
    //   status
    // });

    // Dummy response - update this with your vector DB implementation
    const updatedDoc = {
      id: documentId,
      title: title || "Document Title",
      category: category || "General",
      status: status || "active",
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json(
      {
        message: "Document updated successfully",
        document: updatedDoc,
        status: 200,
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        message: `An error occurred: ${error.message}`,
        status: 500,
      },
      { status: 500 }
    );
  }
}

// DELETE - Delete document
export async function DELETE(request: NextRequest) {
  try {
    const admin = verifyAdmin(request);
    if (!admin) {
      return NextResponse.json(
        { message: "Unauthorized: Admin access required", status: 403 },
        { status: 403 }
      );
    }

    const { documentId } = await request.json();

    if (!documentId) {
      return NextResponse.json(
        { message: "Document ID is required", status: 400 },
        { status: 400 }
      );
    }

    // TODO: Replace with actual vector DB delete
    // await vectorDB.deleteDocument(documentId);

    // Dummy response - update this with your vector DB implementation

    return NextResponse.json(
      {
        message: "Document deleted successfully",
        status: 200,
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        message: `An error occurred: ${error.message}`,
        status: 500,
      },
      { status: 500 }
    );
  }
}
