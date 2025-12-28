"use client";
import { useEffect, useRef, useState } from "react";
import { Paperclip, X, ArrowDown, Check } from "lucide-react";
import Image from "next/image";

interface FileUploaderProps {
  selectedFiles: File[];
  setSelectedFiles: React.Dispatch<React.SetStateAction<File[]>>;
  fileError: string | null;
  setFileError: (error: string | null) => void;
  onFilePreview: (file: File) => void;
  MAX_FILES: number;
  MAX_FILE_SIZE: number;
}

const FileUploader = ({
  selectedFiles,
  setSelectedFiles,
  fileError,
  setFileError,
  onFilePreview,
  MAX_FILES,
  MAX_FILE_SIZE,
}: FileUploaderProps) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [showAudioOptions, setShowAudioOptions] = useState<number | null>(null);
  const [audioProcessingOptions, setAudioProcessingOptions] = useState<
    Record<number, string>
  >({});
  const audioOptionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Handle closing audio options dropdown when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (
        audioOptionsRef.current &&
        !audioOptionsRef.current.contains(event.target as Node) &&
        showAudioOptions !== null
      ) {
        setShowAudioOptions(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showAudioOptions]);

  // Validate file type and size
  const validateFile = (file: File): boolean => {
    const fileType = file.type.toLowerCase();
    const fileName = file.name.toLowerCase();

    // Reject SVG files
    if (fileType.includes("svg") || fileName.endsWith(".svg")) {
      setFileError("SVG files are not supported");
      return false;
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      setFileError(`File size exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit`);
      return false;
    }

    // Clear any previous errors
    setFileError(null);
    return true;
  };

  // Handle file selection from input
  const handleFileSelection = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Check if we're exceeding the max number of files
    if (selectedFiles.length + files.length > MAX_FILES) {
      setFileError(`You can upload a maximum of ${MAX_FILES} files`);
      return;
    }

    handleFiles(files);
  };

  // Handle files from drag and drop or file input
  const handleFiles = (files: FileList) => {
    if (!files || files.length === 0) return;

    // Validate each file
    const validFiles: File[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (validateFile(file)) {
        validFiles.push(file);
      } else {
        // Stop at the first invalid file
        return;
      }
    }

    // Add valid files to the state
    if (validFiles.length > 0) {
      setSelectedFiles((prevFiles: File[]) => [...prevFiles, ...validFiles]);
    }
  };

  // Drag and drop handlers
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Only set drag over to false if we're leaving the main container
    if (e.currentTarget === e.target) {
      setIsDragOver(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFiles(files);
    }
  };

  // Get file icon and color based on file type
  const getFileDetails = (file: File) => {
    const extension = file.name.split(".").pop()?.toLowerCase();
    const fileType = file.type.toLowerCase();

    // Handle audio files
    if (
      fileType.includes("audio") ||
      extension === "mp3" ||
      extension === "wav" ||
      extension === "webm" ||
      extension === "m4a"
    ) {
      return {
        icon: "🎵",
        color: " text-black bg-purple-100 border-purple-300",
        isAudio: true,
      };
    }

    // Return appropriate styling based on file type
    switch (extension) {
      case "pdf":
        return { icon: "📄", color: "text-black bg-red-100 border-red-300" };
      case "doc":
      case "docx":
        return {
          icon: "📝",
          color: "text-black bg-blue-100 border-blue-300",
        };
      case "xls":
      case "xlsx":
        return {
          icon: "📊",
          color: "text-black bg-green-100 border-green-300",
        };
      case "jpg":
      case "jpeg":
      case "png":
      case "gif":
      case "webp":
        return {
          icon: "🖼️",
          color: "text-black bg-purple-100 border-purple-300",
          isImage: true,
        };
      default:
        return {
          icon: "📎",
          color: "text-black bg-gray-100 border-gray-300",
        };
    }
  };

  return (
    <>
      {/* Upload Button */}
      <div className="relative">
        <button
          title="Upload file"
          className="p-2 rounded-full transition-colors duration-200"
          style={{ background: 'var(--color-input-bg)', color: 'var(--color-text)' }}
          onClick={() => document.getElementById("chat-file-input")?.click()}
          type="button"
        >
          <Paperclip size={18} />
        </button>
        <input
          id="chat-file-input"
          type="file"
          className="hidden"
          multiple
          accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt"
          onChange={handleFileSelection}
        />
      </div>

      {/* File Previews (shown when files are selected) */}
      {selectedFiles.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-2 pb-1">
          {selectedFiles.map((file, index) => {
            const { icon, color, isImage } = getFileDetails(file);
            return (
              <div
                key={index}
                className={`relative flex items-center border rounded-md px-2 py-1 text-sm cursor-pointer hover:opacity-80 transition-opacity`}
                style={{
                  background: 'var(--color-input-bg)',
                  color: 'var(--color-text)',
                  borderColor: 'var(--color-border)',
                }}
                onClick={() => onFilePreview(file)}
                title="Click to preview"
              >
                {isImage ? (
                  <div className="w-5 h-5 mr-2 overflow-hidden rounded">
                    <Image
                      width={100}
                      height={100}
                      src={URL.createObjectURL(file)}
                      alt={file.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : getFileDetails(file).isAudio ? (
                  <div className="w-5 h-5 mr-2 flex items-center justify-center text-purple-600 relative">
                    <span>🎵</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent the preview from opening
                        setShowAudioOptions(
                          showAudioOptions === index ? null : index
                        );
                      }}
                      className="ml-1 hover:bg-gray-200 rounded-full p-0.5 absolute -right-4 -bottom-1"
                      title="Audio options"
                    >
                      <ArrowDown size={12} />
                    </button>
                    {showAudioOptions === index && (
                      <div
                        ref={audioOptionsRef}
                        className="absolute top-full left-0 mt-1 z-50 bg-white border border-gray-300 rounded-lg shadow-lg text-xs w-32"
                      >
                        <div
                          className={`px-3 py-2 hover:bg-gray-100 cursor-pointer flex justify-between items-center ${
                            audioProcessingOptions[index] === "send-as-is"
                              ? "bg-blue-50"
                              : ""
                          }`}
                          onClick={(e) => {
                            e.stopPropagation();
                            setAudioProcessingOptions({
                              ...audioProcessingOptions,
                              [index]: "send-as-is",
                            });
                            setShowAudioOptions(null);
                          }}
                        >
                          Send as audio
                          {audioProcessingOptions[index] === "send-as-is" && (
                            <Check size={12} />
                          )}
                        </div>
                        <div
                          className={`px-3 py-2 hover:bg-gray-100 cursor-pointer flex justify-between items-center ${
                            audioProcessingOptions[index] === "transcribe"
                              ? "bg-blue-50"
                              : ""
                          }`}
                          onClick={(e) => {
                            e.stopPropagation();
                            setAudioProcessingOptions({
                              ...audioProcessingOptions,
                              [index]: "transcribe",
                            });
                            setShowAudioOptions(null);
                          }}
                        >
                          Transcribe to text
                          {audioProcessingOptions[index] === "transcribe" && (
                            <Check size={12} />
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <span className="mr-1">{icon}</span>
                )}
                <span className="truncate max-w-25">{file.name}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent the preview from opening
                    setSelectedFiles((files: File[]) =>
                      files.filter((_, i: number) => i !== index)
                    );
                    if (selectedFiles.length === 1) {
                      setFileError(null);
                    }
                  }}
                  className="ml-1 rounded-full p-0.5 z-10 transition-colors duration-200"
                  style={{ background: 'var(--color-card-bg)' }}
                  title="Remove file"
                >
                  <X size={14} />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Audio Processing Options Dropdown */}
      {showAudioOptions !== null && (
        <div
          ref={audioOptionsRef}
          className="absolute z-50 bottom-full mb-2 right-0 w-48 rounded-lg shadow-lg text-sm transition-colors duration-200"
          style={{ background: 'var(--color-card-bg)', color: 'var(--color-text)', border: '1px solid var(--color-border)' }}
        >
          <div className="px-4 py-2 font-semibold border-b">Audio Options</div>
          <div className="flex flex-col gap-1 p-2">
            <button
              onClick={() => {
                setAudioProcessingOptions((prev) => ({
                  ...prev,
                  [showAudioOptions]: "trim",
                }));
                setShowAudioOptions(null);
              }}
              className="flex items-center gap-2 px-3 py-2 rounded-md cursor-pointer transition-colors duration-200"
              style={{ background: 'var(--color-input-bg)' }}
            >
              <Check
                size={16}
                className={`${
                  audioProcessingOptions[showAudioOptions] === "trim"
                    ? "text-green-500"
                    : "text-gray-400"
                }`}
              />
              Trim Silence
            </button>
            <button
              onClick={() => {
                setAudioProcessingOptions((prev) => ({
                  ...prev,
                  [showAudioOptions]: "normalize",
                }));
                setShowAudioOptions(null);
              }}
              className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-100 cursor-pointer"
            >
              <Check
                size={16}
                className={`${
                  audioProcessingOptions[showAudioOptions] === "normalize"
                    ? "text-green-500"
                    : "text-gray-400"
                }`}
              />
              Normalize Volume
            </button>
            <button
              onClick={() => {
                setAudioProcessingOptions((prev) => ({
                  ...prev,
                  [showAudioOptions]: "none",
                }));
                setShowAudioOptions(null);
              }}
              className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-100 cursor-pointer"
            >
              <Check
                size={16}
                className={`${
                  audioProcessingOptions[showAudioOptions] === "none"
                    ? "text-green-500"
                    : "text-gray-400"
                }`}
              />
              No Processing
            </button>
          </div>
        </div>
      )}

      {/* Drag and Drop Overlay */}
      {isDragOver && (
        <div className="absolute inset-0 z-50 border-2 border-dashed rounded-xl flex items-center justify-center transition-colors duration-300"
          style={{ background: 'var(--color-overlay-bg, rgba(34,142,152,0.08))', borderColor: 'var(--color-primary)' }}>
          <div className="text-center">
            <div className="text-4xl mb-2">📁</div>
            <div className="text-[#228E98] font-semibold">Drop files here</div>
            <div className="text-sm text-gray-600">
              Support: Images, PDF, DOC, XLS, PPT, TXT
            </div>
          </div>
        </div>
      )}

      {/* File Error Message */}
      {fileError && (
        <div className="text-red-500 text-xs px-1 pt-2">{fileError}</div>
      )}
    </>
  );
};

export default FileUploader;
