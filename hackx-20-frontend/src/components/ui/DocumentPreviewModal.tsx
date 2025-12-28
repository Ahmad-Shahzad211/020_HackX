"use client";
import { useState, useEffect } from "react";
import { X, Download, FileText, Image as ImageIcon, FileSpreadsheet, Eye } from "lucide-react";

interface DocumentPreviewModalProps {
  file: File | null;
  isOpen: boolean;
  onClose: () => void;
}

const DocumentPreviewModal = ({ file, isOpen, onClose }: DocumentPreviewModalProps) => {
  const [objectUrl, setObjectUrl] = useState<string>("");
  const [previewError, setPreviewError] = useState<string>("");
  const [textContent, setTextContent] = useState<string>("");
  const [isClient, setIsClient] = useState(false);

  // All hooks must be called before any early returns
  useEffect(() => {
    if (file && isOpen) {
      const url = URL.createObjectURL(file);
      setObjectUrl(url);
      setPreviewError("");
      
      return () => {
        URL.revokeObjectURL(url);
      };
    }
  }, [file, isOpen]);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    const loadTextContent = async () => {
      if (isClient && file && isOpen && isTextFile()) {
        try {
          const text = await file.text();
          setTextContent(text);
        } catch (error) {
          setPreviewError("Failed to read text file");
        }
      }
    };
    
    loadTextContent();
  }, [file, isOpen, isClient]);

  // Helper functions
  const getFileType = () => {
    if (!file) return "";
    const extension = file.name.split(".").pop()?.toLowerCase();
    return extension;
  };

  const getFileIcon = () => {
    const extension = getFileType();
    switch (extension) {
      case "pdf":
        return <FileText className="text-red-500" size={20} />;
      case "doc":
      case "docx":
        return <FileText className="text-blue-500" size={20} />;
      case "xls":
      case "xlsx":
        return <FileSpreadsheet className="text-green-500" size={20} />;
      case "jpg":
      case "jpeg":
      case "png":
      case "gif":
      case "webp":
        return <ImageIcon className="text-purple-500" size={20} />;
      default:
        return <FileText className="text-gray-500" size={20} />;
    }
  };

  const isImage = () => {
    const extension = getFileType();
    return ["jpg", "jpeg", "png", "gif", "webp"].includes(extension || "");
  };

  const isPDF = () => {
    const extension = getFileType();
    return extension === "pdf";
  };

  const isOfficeDocument = () => {
    const extension = getFileType();
    return ["doc", "docx", "xls", "xlsx", "ppt", "pptx"].includes(extension || "");
  };

  const isTextFile = () => {
    const extension = getFileType();
    return ["txt", "csv"].includes(extension || "");
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const handleDownload = () => {
    if (!file) return;
    const link = document.createElement("a");
    link.href = objectUrl;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Early return after all hooks
  if (!isOpen || !file) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-lg sm:rounded-xl shadow-2xl max-w-4xl w-full max-h-[95vh] sm:max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-3 sm:p-4 border-b border-gray-200">
          <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
            <div className="flex-shrink-0">
              {getFileIcon()}
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-sm sm:text-lg font-semibold text-gray-800 truncate">
                {file.name}
              </h3>
              <p className="text-xs sm:text-sm text-gray-500">
                {formatFileSize(file.size)} • {getFileType()?.toUpperCase()}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
            <button
              onClick={handleDownload}
              className="p-1.5 sm:p-2 text-gray-500 hover:text-[#228E98] hover:bg-gray-100 rounded-full transition-colors"
              title="Download file"
            >
              <Download size={16} className="sm:w-5 sm:h-5" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 sm:p-2 text-gray-500 hover:text-red-500 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X size={16} className="sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-auto p-2 sm:p-4">
          {previewError ? (
            <div className="flex flex-col items-center justify-center h-48 sm:h-64 text-gray-500">
              <Eye size={32} className="sm:w-12 sm:h-12 mb-3 sm:mb-4 opacity-50" />
              <p className="text-base sm:text-lg mb-2 font-medium">Preview not available</p>
              <p className="text-sm text-center px-4">{previewError}</p>
            </div>
          ) : isImage() ? (
            <div className="flex justify-center">
              <img
                src={objectUrl}
                alt={file.name}
                className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
                onError={() => setPreviewError("Failed to load image")}
              />
            </div>
          ) : isPDF() ? (
            <div className="w-full h-64 sm:h-96 border border-gray-300 rounded-lg overflow-hidden">
              <iframe
                src={objectUrl}
                className="w-full h-full"
                title={file.name}
                onError={() => setPreviewError("Failed to load PDF")}
              />
            </div>
          ) : isOfficeDocument() ? (
            <div className="flex flex-col items-center justify-center h-48 sm:h-64 text-gray-500">
              <div className="mb-3 sm:mb-4">
                {getFileIcon()}
              </div>
              <p className="text-base sm:text-lg mb-2 font-medium">Office Document Preview</p>
              <p className="text-sm text-center px-4 mb-3 sm:mb-4 max-w-md">
                Word and Excel documents cannot be previewed directly in the browser.<br />
                Please download the file to view it in the appropriate application.
              </p>
              <div className="space-y-2 flex flex-col items-center">
                <button
                  onClick={handleDownload}
                  className="px-4 py-2 bg-[#228E98] text-white rounded-lg hover:opacity-90 transition-opacity flex items-center space-x-2"
                >
                  <Download size={16} />
                  <span>Download & Open</span>
                </button>
                <p className="text-xs text-gray-400 text-center">
                  File will open in Microsoft Office or compatible app
                </p>
              </div>
            </div>
          ) : isTextFile() ? (
            <div className="w-full h-64 sm:h-96 border border-gray-300 rounded-lg overflow-auto bg-gray-50 p-4">
              <pre className="text-sm text-gray-800 whitespace-pre-wrap font-mono">
                {isClient ? textContent || "Loading..." : "Loading..."}
              </pre>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-48 sm:h-64 text-gray-500">
              <div className="mb-3 sm:mb-4">
                {getFileIcon()}
              </div>
              <p className="text-base sm:text-lg mb-2 font-medium">Preview not available</p>
              <p className="text-sm text-center px-4 mb-3 sm:mb-4">
                This file type cannot be previewed.<br />
                You can download it to view the content.
              </p>
              <div className="flex justify-center">
                <button
                  onClick={handleDownload}
                  className="px-3 py-2 sm:px-4 sm:py-2 bg-[#228E98] text-white rounded-lg hover:opacity-90 transition-opacity flex items-center space-x-2"
                >
                  <Download size={14} className="sm:w-4 sm:h-4" />
                  <span className="text-sm sm:text-base">Download File</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3 sm:p-4 border-t border-gray-200 flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors text-sm sm:text-base"
          >
            Close
          </button>
         
        </div>
      </div>
    </div>
  );
};

export default DocumentPreviewModal;
