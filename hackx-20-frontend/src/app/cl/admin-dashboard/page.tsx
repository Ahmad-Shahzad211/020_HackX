"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/app/cl/store/userInfoStore";
import Sidebar from "@/components/sidebar";
import Navbar from "@/components/navbar";
import { motion, AnimatePresence } from "framer-motion";
import { sidebarVariants } from "@/data/constant";
import { 
  Users, 
  FileText, 
  Trash2, 
  Shield, 
  UserCog,
  Calendar,
  Mail,
  CreditCard,
  Search,
  Upload,
  X,
  Edit2
} from "lucide-react";

interface User {
  _id: string;
  fullName: string;
  email: string;
  role: string;
  plan: string;
  lastLogin: string | null;
  createdAt: string;
}

interface Document {
  id: string;
  title: string;
  category: string;
  uploadedAt: string;
  status: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const userRole = useUserStore((state) => state.userRole);
  
  const [users, setUsers] = useState<User[]>([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [message, setMessage] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  // Document states
  const [documents, setDocuments] = useState<Document[]>([]);
  const [docLoading, setDocLoading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [docTitle, setDocTitle] = useState("");
  const [docCategory, setDocCategory] = useState("General");
  const [uploadingDoc, setUploadingDoc] = useState(false);

  useEffect(() => {
    // Check if user is admin
    if (userRole !== "admin") {
      router.push("/cl/chatscreen");
      return;
    }

    fetchUsers();
    fetchDocuments();
  }, [userRole, router]);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/admin/users", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.status === 200) {
        setUsers(data.users);
        setTotalUsers(data.totalUsers);
      } else {
        setMessage(data.message);
      }
    } catch (error: any) {
      setMessage("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user?")) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/admin/users", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userId }),
      });

      const data = await response.json();

      if (data.status === 200) {
        setMessage("User deleted successfully");
        fetchUsers();
      } else {
        setMessage(data.message);
      }
    } catch (error: any) {
      setMessage("Failed to delete user");
    }
  };

  const handleToggleAdmin = async (userId: string, currentRole: string) => {
    const newRole = currentRole === "admin" ? "user" : "admin";
    
    if (!confirm(`Are you sure you want to change this user's role to ${newRole}?`)) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userId, role: newRole }),
      });

      const data = await response.json();

      if (data.status === 200) {
        setMessage(`User role updated to ${newRole} successfully`);
        fetchUsers();
      } else {
        setMessage(data.message);
      }
    } catch (error: any) {
      setMessage("Failed to update user role");
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Never";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Document Management Functions
  const fetchDocuments = async () => {
    try {
      setDocLoading(true);
      const token = localStorage.getItem("token");
      const response = await fetch("/api/admin/documents", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.status === 200) {
        setDocuments(data.documents);
      } else {
        setMessage(data.message);
      }
    } catch (error: any) {
      setMessage("Failed to fetch documents");
    } finally {
      setDocLoading(false);
    }
  };

  const handleUploadDocument = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!uploadFile || !docTitle || !docCategory) {
      setMessage("Please fill in all fields");
      return;
    }

    try {
      setUploadingDoc(true);
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("file", uploadFile);
      formData.append("title", docTitle);
      formData.append("category", docCategory);

      const response = await fetch("/api/admin/documents", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (data.status === 200) {
        setMessage("Document uploaded successfully");
        setShowUploadModal(false);
        setUploadFile(null);
        setDocTitle("");
        setDocCategory("General");
        fetchDocuments();
      } else {
        setMessage(data.message);
      }
    } catch (error: any) {
      setMessage("Failed to upload document");
    } finally {
      setUploadingDoc(false);
    }
  };

  const handleDeleteDocument = async (documentId: string) => {
    if (!confirm("Are you sure you want to delete this document?")) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/admin/documents", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ documentId }),
      });

      const data = await response.json();

      if (data.status === 200) {
        setMessage("Document deleted successfully");
        fetchDocuments();
      } else {
        setMessage(data.message);
      }
    } catch (error: any) {
      setMessage("Failed to delete document");
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  if (loading) {
    return (
      <div className="flex h-screen overflow-hidden relative transition-colors duration-300"
        style={{ backgroundColor: 'var(--background)' }}
      >
        <AnimatePresence>
          {isSidebarOpen && (
            <motion.div
              initial="closed"
              animate="open"
              exit="closed"
              variants={sidebarVariants}
              className="overflow-hidden md:relative fixed left-0 top-0 h-full z-50"
            >
              <Sidebar setIsSidebarOpen={setIsSidebarOpen} hideChats={true} />
            </motion.div>
          )}
        </AnimatePresence>
        <main className={`flex-1 flex flex-col h-full overflow-hidden relative ${
          isSidebarOpen ? "hidden md:flex" : "flex"
        }`}>
          <div className="pt-4 py-1 shrink-0">
            <Navbar toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />
          </div>
          <div className="flex justify-center items-center flex-1" style={{ backgroundColor: 'var(--background)' }}>
            <div className="text-xl" style={{ color: 'var(--color-text)' }}>Loading...</div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden relative transition-colors duration-300"
      id="admin-dashboard"
      style={{ backgroundColor: 'var(--background)' }}
    >
      {/* Mobile backdrop overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 md:hidden transition-colors duration-300"
            style={{ background: 'var(--background)' }}
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial="closed"
            animate="open"
            exit="closed"
            variants={sidebarVariants}
            className="overflow-hidden md:relative fixed left-0 top-0 h-full z-50"
          >
            <Sidebar setIsSidebarOpen={setIsSidebarOpen} hideChats={true} />
          </motion.div>
        )}
      </AnimatePresence>

      <main className={`flex-1 flex flex-col h-full overflow-hidden relative ${
        isSidebarOpen ? "hidden md:flex" : "flex"
      }`}>
        {/* Navbar */}
        <div className="pt-4 py-1 shrink-0">
          <Navbar toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8" style={{ backgroundColor: 'var(--color-card-bg)' }}>
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--color-primary)' }}>
                Admin Dashboard
              </h1>
              <p className="text-lg" style={{ color: 'var(--color-text-muted)' }}>
                Manage users and system settings
              </p>
            </div>

            {/* Message */}
            {message && (
              <div
                className="mb-6 p-4 rounded-lg"
                style={{ backgroundColor: 'var(--background)', border: '1px solid var(--color-border)' }}
              >
                <p style={{ color: 'var(--color-text)' }}>{message}</p>
              </div>
            )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div
            className="p-6 rounded-lg shadow-md"
            style={{ backgroundColor: 'var(--background)', border: '1px solid var(--color-border)' }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm mb-1" style={{ color: 'var(--color-text-muted)' }}>
                  Total Users
                </p>
                <p className="text-3xl font-bold" style={{ color: 'var(--color-primary)' }}>
                  {totalUsers}
                </p>
              </div>
              <Users size={40} style={{ color: 'var(--color-primary)' }} />
            </div>
          </div>

          <div
            className="p-6 rounded-lg shadow-md"
            style={{ backgroundColor: 'var(--background)', border: '1px solid var(--color-border)' }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm mb-1" style={{ color: 'var(--color-text-muted)' }}>
                  Admin Users
                </p>
                <p className="text-3xl font-bold" style={{ color: 'var(--color-primary)' }}>
                  {users.filter((u) => u.role === "admin").length}
                </p>
              </div>
              <Shield size={40} style={{ color: 'var(--color-primary)' }} />
            </div>
          </div>

          <div
            className="p-6 rounded-lg shadow-md"
            style={{ backgroundColor: 'var(--background)', border: '1px solid var(--color-border)' }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm mb-1" style={{ color: 'var(--color-text-muted)' }}>
                  Documents
                </p>
                <p className="text-3xl font-bold" style={{ color: 'var(--color-primary)' }}>
                  {documents.length}
                </p>
              </div>
              <FileText size={40} style={{ color: 'var(--color-primary)' }} />
            </div>
          </div>
        </div>

        {/* User Management */}
        <div
          className="rounded-lg shadow-md p-6"
          style={{ backgroundColor: 'var(--background)', border: '1px solid var(--color-border)' }}
        >
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <h2 className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>
              User Management
            </h2>
            
            {/* Search Bar */}
            <div className="relative w-full sm:w-auto">
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 rounded-lg w-full sm:w-64 focus:outline-none focus:ring-2"
                style={{
                  backgroundColor: 'var(--color-input-bg)',
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-text)',
                  borderWidth: 1,
                }}
              />
              <Search
                size={20}
                className="absolute left-3 top-1/2 transform -translate-y-1/2"
                style={{ color: 'var(--color-text-muted)' }}
              />
            </div>
          </div>

          {/* Users Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: '2px solid var(--color-border)' }}>
                  <th className="text-left py-3 px-4" style={{ color: 'var(--color-text)' }}>
                    Name
                  </th>
                  <th className="text-left py-3 px-4" style={{ color: 'var(--color-text)' }}>
                    Email
                  </th>
                  <th className="text-left py-3 px-4" style={{ color: 'var(--color-text)' }}>
                    Role
                  </th>
                  <th className="text-left py-3 px-4" style={{ color: 'var(--color-text)' }}>
                    Plan
                  </th>
                  <th className="text-left py-3 px-4" style={{ color: 'var(--color-text)' }}>
                    Last Login
                  </th>
                  <th className="text-left py-3 px-4" style={{ color: 'var(--color-text)' }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr
                    key={user._id}
                    style={{ borderBottom: '1px solid var(--color-border)' }}
                    className="hover:opacity-80 transition-opacity"
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        <UserCog size={18} className="mr-2" style={{ color: 'var(--color-text-muted)' }} />
                        <span style={{ color: 'var(--color-text)' }}>{user.fullName}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        <Mail size={18} className="mr-2" style={{ color: 'var(--color-text-muted)' }} />
                        <span style={{ color: 'var(--color-text)' }}>{user.email}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className="px-3 py-1 rounded-full text-xs font-semibold"
                        style={{
                          backgroundColor: user.role === "admin" ? 'var(--color-primary)' : 'var(--color-input-bg)',
                          color: user.role === "admin" ? '#fff' : 'var(--color-text)',
                        }}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        <CreditCard size={18} className="mr-2" style={{ color: 'var(--color-text-muted)' }} />
                        <span style={{ color: 'var(--color-text)' }}>{user.plan}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        <Calendar size={18} className="mr-2" style={{ color: 'var(--color-text-muted)' }} />
                        <span style={{ color: 'var(--color-text)' }}>
                          {formatDate(user.lastLogin)}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleToggleAdmin(user._id, user.role)}
                          className="p-2 rounded-lg transition-colors"
                          style={{ backgroundColor: 'var(--color-input-bg)' }}
                          title={user.role === "admin" ? "Remove admin" : "Make admin"}
                        >
                          <Shield size={18} style={{ color: 'var(--color-primary)' }} />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user._id)}
                          className="p-2 rounded-lg transition-colors hover:bg-red-100"
                          style={{ backgroundColor: 'var(--color-input-bg)' }}
                          title="Delete user"
                        >
                          <Trash2 size={18} style={{ color: '#ef4444' }} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredUsers.length === 0 && (
              <div className="text-center py-8">
                <p style={{ color: 'var(--color-text-muted)' }}>No users found</p>
              </div>
            )}
          </div>
        </div>

        {/* Document Management Section */}
        <div
          className="rounded-lg shadow-md p-6 mt-8"
          style={{ backgroundColor: 'var(--background)', border: '1px solid var(--color-border)' }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>
              Document Management
            </h2>
            <button
              onClick={() => setShowUploadModal(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all hover:opacity-90"
              style={{ backgroundColor: 'var(--color-primary)', color: 'white' }}
            >
              <Upload size={18} />
              Upload Document
            </button>
          </div>

          {docLoading ? (
            <p style={{ color: 'var(--color-text-muted)' }}>Loading documents...</p>
          ) : (
            <div className="overflow-x-auto">
              {documents.length === 0 ? (
                <div className="text-center py-8">
                  <FileText size={48} style={{ color: 'var(--color-text-muted)', margin: '0 auto 16px' }} />
                  <p style={{ color: 'var(--color-text-muted)' }}>No documents found. Upload one to get started!</p>
                </div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                      <th className="text-left py-3 px-4" style={{ color: 'var(--color-text)' }}>Title</th>
                      <th className="text-left py-3 px-4" style={{ color: 'var(--color-text)' }}>Category</th>
                      <th className="text-left py-3 px-4" style={{ color: 'var(--color-text)' }}>Status</th>
                      <th className="text-left py-3 px-4" style={{ color: 'var(--color-text)' }}>Uploaded At</th>
                      <th className="text-left py-3 px-4" style={{ color: 'var(--color-text)' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {documents.map((doc) => (
                      <tr key={doc.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                        <td className="py-3 px-4" style={{ color: 'var(--color-text)' }}>
                          <div className="flex items-center gap-2">
                            <FileText size={18} style={{ color: 'var(--color-primary)' }} />
                            {doc.title}
                          </div>
                        </td>
                        <td className="py-3 px-4" style={{ color: 'var(--color-text)' }}>
                          {doc.category}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className="px-2 py-1 rounded text-xs font-medium"
                            style={{
                              backgroundColor: doc.status === 'active' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(107, 114, 128, 0.2)',
                              color: doc.status === 'active' ? '#22c55e' : '#6b7280',
                            }}
                          >
                            {doc.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm" style={{ color: 'var(--color-text-muted)' }}>
                          {formatDate(doc.uploadedAt)}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                // TODO: Implement edit functionality
                                alert('Edit functionality will be implemented soon');
                              }}
                              className="p-2 rounded hover:opacity-80 transition"
                              style={{
                                backgroundColor: 'rgba(59, 130, 246, 0.2)',
                                color: '#3b82f6',
                              }}
                              title="Edit document"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              onClick={() => handleDeleteDocument(doc.id)}
                              className="p-2 rounded hover:opacity-80 transition"
                              style={{
                                backgroundColor: 'rgba(239, 68, 68, 0.2)',
                                color: '#ef4444',
                              }}
                              title="Delete document"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>

        {/* Upload Modal */}
        {showUploadModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div
              className="rounded-lg p-6 max-w-md w-full"
              style={{ backgroundColor: 'var(--background)', border: '1px solid var(--color-border)' }}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold" style={{ color: 'var(--color-text)' }}>
                  Upload Document
                </h3>
                <button
                  onClick={() => {
                    setShowUploadModal(false);
                    setUploadFile(null);
                    setDocTitle("");
                    setDocCategory("General");
                  }}
                  className="p-1 rounded hover:opacity-80"
                  style={{ backgroundColor: 'rgba(107, 114, 128, 0.2)' }}
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleUploadDocument} className="space-y-4">
                <div>
                  <label style={{ color: 'var(--color-text)' }} className="block text-sm font-medium mb-2">
                    Title
                  </label>
                  <input
                    type="text"
                    value={docTitle}
                    onChange={(e) => setDocTitle(e.target.value)}
                    placeholder="Document title"
                    className="w-full px-3 py-2 rounded-lg"
                    style={{
                      backgroundColor: 'var(--color-input-bg)',
                      border: '1px solid var(--color-border)',
                      color: 'var(--color-text)',
                    }}
                    required
                  />
                </div>

                <div>
                  <label style={{ color: 'var(--color-text)' }} className="block text-sm font-medium mb-2">
                    Category
                  </label>
                  <select
                    value={docCategory}
                    onChange={(e) => setDocCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg"
                    style={{
                      backgroundColor: 'var(--color-input-bg)',
                      border: '1px solid var(--color-border)',
                      color: 'var(--color-text)',
                    }}
                  >
                    <option value="General">General</option>
                    <option value="Constitutional">Constitutional</option>
                    <option value="Criminal">Criminal</option>
                    <option value="Civil">Civil</option>
                    <option value="Corporate">Corporate</option>
                    <option value="Labor">Labor</option>
                  </select>
                </div>

                <div>
                  <label style={{ color: 'var(--color-text)' }} className="block text-sm font-medium mb-2">
                    File
                  </label>
                  <label
                    className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-all hover:opacity-80"
                    style={{
                      borderColor: uploadFile ? 'var(--color-primary)' : 'var(--color-border)',
                      backgroundColor: uploadFile ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                    }}
                  >
                    <input
                      type="file"
                      onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                      className="hidden"
                      accept=".pdf,.doc,.docx,.txt"
                      required
                    />
                    <div className="flex flex-col items-center">
                      <Upload size={24} style={{ color: 'var(--color-primary)', marginBottom: 8 }} />
                      <p style={{ color: 'var(--color-text)' }} className="text-sm font-medium">
                        {uploadFile ? uploadFile.name : "Click to upload or drag and drop"}
                      </p>
                      <p style={{ color: 'var(--color-text-muted)' }} className="text-xs mt-1">
                        PDF, DOC, DOCX, TXT
                      </p>
                    </div>
                  </label>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={uploadingDoc}
                    className="flex-1 py-2 rounded-lg font-medium transition-all disabled:opacity-70"
                    style={{ backgroundColor: 'var(--color-primary)', color: 'white' }}
                  >
                    {uploadingDoc ? "Uploading..." : "Upload"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowUploadModal(false);
                      setUploadFile(null);
                      setDocTitle("");
                      setDocCategory("General");
                    }}
                    className="flex-1 py-2 rounded-lg font-medium transition-all"
                    style={{
                      backgroundColor: 'var(--color-input-bg)',
                      color: 'var(--color-text)',
                      border: '1px solid var(--color-border)',
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
          </div>
        </div>
      </main>
    </div>
  );
}
