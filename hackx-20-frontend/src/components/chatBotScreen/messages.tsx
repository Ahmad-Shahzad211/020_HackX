"use client";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, User, X, Download, Eye } from "lucide-react";
import CustomMarkdown from "../ReactMarkdown";
import { useChatbotStore } from "@/app/cl/store/chatbotStore";
import TypewriterEffect from "../ui/TypewriterEffect";
import { useState } from "react";
import FileIcon from "./FileIcon";
import AudioPlayer from "./AudioPlayer";
import Image from "next/image";

const Messages = () => {
  const messages = useChatbotStore((state) => state.messages);
  const messageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
  };

  // Store which audio files are expanded
  const [expandedAudio, setExpandedAudio] = useState<{
    [key: string]: boolean;
  }>({});

  // File preview modal state
  const [previewFile, setPreviewFile] = useState<{
    file: any;
    type: "image" | "pdf" | "other";
  } | null>(null);

  // Toggle audio player visibility
  const toggleAudioPlayer = (messageIndex: number, fileIndex: number) => {
    const key = `${messageIndex}-${fileIndex}`;
    setExpandedAudio((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // Check if a file is an audio file or voice recording
  const isAudioFile = (file: any) => {
    if (!file || !file.type) return false;

    // Check if it's an audio file by MIME type
    if (file.type.startsWith("audio/")) return true;

    // Check filename for common audio extensions
    const name = file.name?.toLowerCase() || "";
    return (
      name.endsWith(".mp3") ||
      name.endsWith(".wav") ||
      name.endsWith(".ogg") ||
      name.endsWith(".m4a") ||
      (name.endsWith(".webm") && name.includes("voice"))
    );
  };

  // Check if a file is a voice recording specifically
  const isVoiceRecording = (file: any) => {
    if (!file) return false;

    // Check specific voice recording indicators
    if (file.type === "audio/voice") return true;
    if (file.name?.includes("voice-message")) return true;
    if (file.name?.includes("recording") && file.type?.startsWith("audio/"))
      return true;

    return false;
  };

  // Check if file is an image
  const isImageFile = (file: any) => {
    if (!file || !file.type) return false;
    return file.type.startsWith("image/");
  };

  // Check if file is a PDF
  const isPDFFile = (file: any) => {
    if (!file) return false;
    return (
      file.type === "application/pdf" ||
      file.name?.toLowerCase().endsWith(".pdf")
    );
  };

  // Get file URL for preview
  const getFileUrl = (file: any) => {
    if (file instanceof File) {
      return URL.createObjectURL(file);
    }
    return file.url || file.src || "";
  };

  // Handle file click for preview
  const handleFileClick = (file: any) => {
    if (isImageFile(file)) {
      setPreviewFile({ file, type: "image" });
    } else if (isPDFFile(file)) {
      setPreviewFile({ file, type: "pdf" });
    } else if (isAudioFile(file)) {
      // Audio files handled separately with expandedAudio state
      return;
    } else {
      setPreviewFile({ file, type: "other" });
    }
  };

  // Close preview modal
  const closePreview = () => {
    if (previewFile?.file instanceof File) {
      URL.revokeObjectURL(getFileUrl(previewFile.file));
    }
    setPreviewFile(null);
  };

  return (
    <>
      <div className="space-y-1 max-w-5xl mx-auto w-full pb-20 transition-colors duration-300" style={{ color: 'var(--color-text)' }}>
        <AnimatePresence initial={false}>
          {messages.map((msg, index) => (
            <motion.div
              key={index}
              className={`flex items-end gap-2 ${
                msg.role === "user" ? "justify-end" : "justify-start"
              }`}
              variants={messageVariants}
              initial="initial"
              animate="animate"
              layout
            >
              {msg.role === "ai" && (
                <div className="shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full   flex items-center justify-center text-var(--color-text)">
                  <Bot size={20} />
                </div>
              )}
              <div className="flex flex-col gap-2 max-w-[75%]">
                <div
                  className={`px-3 rounded-2xl shadow-sm ${
                    msg.role === "user"
                      ? "rounded-br-none"
                      : msg.type === "thinking"
                      ? "rounded-bl-none animate-pulse p-4"
                      : "rounded-bl-none"
                  }`}
                  style={{
                    background: msg.role === "user"
                      ? 'var(--color-primary)'
                      : msg.type === "thinking"
                        ? 'var(--background)'
                        : 'var(--background)',
                    color: msg.role === "user"
                      ? '#fff'
                      : 'var(--color-text)',
                    border: msg.role === "user" ? 'none' : '1px solid var(--color-border)',
                  }}
                >
                  <div className="text-sm sm:text-base leading-relaxed">
                    {msg.role === "user" ? (
                      <CustomMarkdown
                        content={msg.prompt}
                        isUserMessage={true}
                      />
                    ) : msg.type === "thinking" ? (
                      <TypewriterEffect
                        text={msg.ai_response || "Searching..."}
                        speed={100}
                        showCursor={true}
                        cursorChar="●"
                        className="text- font-medium"
                      />
                    ) : (
                      <CustomMarkdown
                        content={msg.ai_response}
                        isUserMessage={false}
                      />
                    )}
                  </div>
                </div>

                {/* File attachments */}
                {msg.file && Array.isArray(msg.file) && msg.file.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {msg.file.map((file, fileIndex) => {
                      const audioKey = `${index}-${fileIndex}`;
                      const isAudio = isAudioFile(file);
                      const isVoice = isVoiceRecording(file);
                      const isImage = isImageFile(file);
                      const isPDF = isPDFFile(file);
                      const showAudioPlayer =
                        expandedAudio[audioKey] && (isAudio || isVoice);

                      return (
                        <div key={fileIndex} className="flex flex-col gap-1">
                          {/* Image preview above message */}
                          {isImage && (
                            <div
                              className="relative cursor-pointer group overflow-hidden rounded-lg max-w-50 max-h-37.5"
                              onClick={() => handleFileClick(file)}
                            >
                              <Image
                                width={100}
                                height={100}
                                src={getFileUrl(file)}
                                alt={file.name || "Image"}
                                className="w-full h-full object-cover transition-transform"
                              />
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                                <Eye
                                  className="text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                  size={24}
                                />
                              </div>
                            </div>
                          )}

                          {/* File attachment item */}
                          <div
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
                              msg.role === "user"
                                ? "bg-[#1a6b73] text-white"
                                : "bg-gray-100 text-gray-800"
                            } ${
                              (isImage || isPDF) && !isAudio && !isVoice
                                ? "cursor-pointer hover:opacity-90 transition-opacity"
                                : isAudio
                                ? "cursor-pointer hover:opacity-90 transition-opacity"
                                : "cursor-default"
                            }`}
                            onClick={() => {
                              if (isAudio || isVoice) {
                                toggleAudioPlayer(index, fileIndex);
                              } else if (isImage || isPDF) {
                                handleFileClick(file);
                              }
                            }}
                          >
                            <FileIcon
                              fileName={file.name || `File ${fileIndex + 1}`}
                              fileType={file.type}
                              size={16}
                            />
                            <span className="text-sm truncate max-w-30">
                              {file.name ||
                                (isVoice
                                  ? "Voice Message"
                                  : `File ${fileIndex + 1}`)}
                            </span>
                            {(isImage || isPDF) && (
                              <Eye size={14} className="ml-1 opacity-70" />
                            )}
                          </div>
                          {/* Audio player (visible when expanded) */}
                          {showAudioPlayer && (
                            <div className="mt-1">
                              <AudioPlayer
                                audioFile={file}
                                theme={msg.role === "user" ? "dark" : "light"}
                              />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
              {msg.role === "user" && (
                <div className="shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gray-300 flex items-center justify-center text-gray-600">
                  <User size={20} />
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* File Preview Modal */}
      <AnimatePresence>
        {previewFile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 transition-colors duration-300"
            style={{ background: 'var(--color-overlay-bg, rgba(0,0,0,0.8))' }}
            onClick={closePreview}
          >
            {previewFile.type === "image" ? (
              // Full-screen image view
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="relative max-w-[90vw] max-h-[90vh] flex items-center justify-center overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Close button */}
                <button
                  onClick={closePreview}
                  className="absolute top-4 right-4 z-10 p-2 bg-black/50 hover:bg-black/70 rounded-full transition-colors text-white"
                >
                  <X size={20} />
                </button>

                {/* Download button */}
                <button
                  onClick={() => {
                    const url = getFileUrl(previewFile.file);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = previewFile.file.name || "download";
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                  }}
                  className="absolute top-4 right-16 z-10 p-2 bg-black/50 hover:bg-black/70 rounded-full transition-colors text-white"
                  title="Download"
                >
                  <Download size={20} />
                </button>

                {/* Image */}
                <Image
                  width={100}
                  height={100}
                  src={getFileUrl(previewFile.file)}
                  alt={previewFile.file.name || "Preview"}
                  className="w-fit object-contain"
                />

                {/* Filename overlay at bottom */}
                {previewFile.file.name && (
                  <div className="absolute bottom-0 left-0 right-0 bg-black/30 backdrop-blur-sm text-white p-3 text-center">
                    <p className="text-sm font-medium truncate">
                      {previewFile.file.name}
                    </p>
                  </div>
                )}
              </motion.div>
            ) : (
              // Other file types (PDF, etc.) - keep existing modal style
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="relative rounded-lg shadow-2xl w-full md:max-w-[80vw] max-w-[95vw] max-h-[95vh] overflow-hidden transition-colors duration-300"
                style={{ background: 'var(--color-card-bg)', color: 'var(--color-text)' }}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
                  <h3 className="md:text-lg text-sm font-medium truncate mr-4" style={{ color: 'var(--color-text)' }}>
                    {previewFile.file.name || "File Preview"}
                  </h3>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        const url = getFileUrl(previewFile.file);
                        const a = document.createElement("a");
                        a.href = url;
                        a.download = previewFile.file.name || "download";
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                      }}
                      className="p-2 hover:bg-gray-100 text-neutral-500 rounded-full transition-colors"
                      title="Download"
                    >
                      <Download size={18} />
                    </button>
                    <button
                      onClick={closePreview}
                      className="p-2 hover:bg-gray-100 text-neutral-500 rounded-full transition-colors"
                    >
                      <X size={18} />
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 max-h-[calc(90vh-80px)] overflow-auto w-full">
                  {previewFile.type === "pdf" && (
                    <iframe
                      src={getFileUrl(previewFile.file)}
                      className="w-full h-[70vh] border-0"
                      title="PDF Preview"
                    />
                  )}

                  {previewFile.type === "other" && (
                    <div className="text-center py-8">
                      <FileIcon
                        fileName={previewFile.file.name || "File"}
                        fileType={previewFile.file.type}
                        size={64}
                      />
                      <p className="mt-4 text-gray-600">
                        Preview not available for this file type
                      </p>
                      <p className="text-sm text-gray-500 mt-2">
                        Click download to view the file
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
export default Messages;
