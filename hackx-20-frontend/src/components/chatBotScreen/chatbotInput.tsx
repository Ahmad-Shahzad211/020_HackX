"use client";
import { sectionFadeInFromBottom, tools } from "@/data/constant";
import { motion } from "framer-motion";
import { chatbotChatHandler } from "@/handlers/chatbotHandler";
import { ChatbotMessageType } from "@/types";
import { useCallback, useEffect, useRef, useState } from "react";
import { useChatbotStore } from "@/app/cl/store/chatbotStore";
import {
  Mic,
  Paperclip,
  Send,
  X,
  Square,
  Trash2,
  ArrowDown,
  Check,
  Settings2,
  Globe,
} from "lucide-react";
import DocumentPreviewModal from "../ui/DocumentPreviewModal";
import legisStore from "@/store/legisStore";
import Image from "next/image";

const ChatbotInput = () => {
  const {
    sessionID,
    thinking,
    inputMessage,
    setSessionID,
    setThinking,
    setMessages,
    setInputMessage,
  } = useChatbotStore();

  // Render styles globally to avoid hydration issues
  useEffect(() => {
    if (typeof document !== 'undefined') {
      const styleId = 'chatbot-input-styles';
      if (!document.getElementById(styleId)) {
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
          .scroll-container::-webkit-scrollbar {
            width: 8px;
            background: var(--color-scrollbar-track);
          }
          .scroll-container::-webkit-scrollbar-thumb {
            background: var(--color-scrollbar-thumb);
            border-radius: 8px;
          }
          .scroll-container::-webkit-scrollbar-corner {
            background: var(--color-scrollbar-track);
          }
          .scroll-container:focus,
          .scroll-container:active {
            outline: none !important;
            border: none !important;
            box-shadow: none !important;
          }
          .scroll-container::placeholder {
            color: var(--color-text-muted);
            opacity: 1;
            transition: color 0.2s;
          }
        `;
        document.head.appendChild(style);
      }
    }
  }, []);

  const [showTools, setShowTools] = useState(false);
  const toolsRef = useRef<HTMLDivElement>(null);
  const selectedTool = legisStore((state) => state.selectedTool);
  const setSelectedTool = legisStore((state) => state.setSelectedTool);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(
    null
  );
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [showAudioOptions, setShowAudioOptions] = useState<number | null>(null);
  const [audioProcessingOptions, setAudioProcessingOptions] = useState<
    Record<number, string>
  >({});
  const audioOptionsRef = useRef<HTMLDivElement>(null);
  const MAX_FILES = 10;
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

  // New state variables for speech recognition
  const [transcription, setTranscription] = useState<string>("");
  const [isTranscribing, setIsTranscribing] = useState<boolean>(false);
  const [recognition, setRecognition] = useState<any>(null);
  const [showRecordingOptions, setShowRecordingOptions] = useState(false);
  const [tempAudioBlob, setTempAudioBlob] = useState<Blob | null>(null);
  const [tempStream, setTempStream] = useState<MediaStream | null>(null);
  const recordingOptionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        toolsRef.current &&
        !toolsRef.current.contains(event.target as Node)
      ) {
        setShowTools(false);
      }

      // Also handle closing audio options dropdown
      if (
        audioOptionsRef.current &&
        !audioOptionsRef.current.contains(event.target as Node) &&
        showAudioOptions !== null
      ) {
        setShowAudioOptions(null);
      }

      // Handle closing recording options
      if (
        recordingOptionsRef.current &&
        !recordingOptionsRef.current.contains(event.target as Node) &&
        showRecordingOptions
      ) {
        setShowRecordingOptions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showAudioOptions, showRecordingOptions]);

  // Client-side mounting effect
  useEffect(() => {
    setIsClient(true);

    // Prevent default drag and drop behavior on the page
    const preventDefaults = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
    };

    const handlePageDrop = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
    };

    // Add event listeners to prevent default browser drag and drop
    document.addEventListener("dragenter", preventDefaults, false);
    document.addEventListener("dragover", preventDefaults, false);
    document.addEventListener("drop", handlePageDrop, false);

    return () => {
      document.removeEventListener("dragenter", preventDefaults, false);
      document.removeEventListener("dragover", preventDefaults, false);
      document.removeEventListener("drop", handlePageDrop, false);
    };
  }, []);
  // auto-focus input field
  useEffect(() => {
    if (!thinking) {
      textareaRef.current?.focus();
    }
  }, [thinking]);

  // Screen size detection for responsive layout
  useEffect(() => {
    if (!isClient) return;

    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 500);
    };
    checkScreenSize(); // Initial check
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, [isClient]);

  // Listen for transcription events from DocumentPreviewModal
  useEffect(() => {
    const handleTranscriptionEvent = (e: CustomEvent) => {
      const transcription = e.detail;
      if (transcription) {
        setInputMessage(transcription);
        if (textareaRef.current) {
          textareaRef.current.focus();
        }
      }
    };

    window.addEventListener(
      "transcription",
      handleTranscriptionEvent as EventListener
    );

    return () => {
      window.removeEventListener(
        "transcription",
        handleTranscriptionEvent as EventListener
      );
    };
  }, [setInputMessage]);

  // Textarea height adjustment
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const adjustHeight = () => {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 85)}px`;
    };

    adjustHeight();

    // Add event listener to handle resize events
    window.addEventListener("resize", adjustHeight);
    return () => window.removeEventListener("resize", adjustHeight);
  }, [inputMessage]);

  const handleSendMessage = async () => {
    const trimmedMessage = inputMessage.trim();
    if ((trimmedMessage === "" && selectedFiles.length === 0) || thinking)
      return;

    // Instead, add the tool to the message only when sending
    let finalMessage = trimmedMessage;
    if (selectedTool) {
      const toolTag = `@${selectedTool.toLowerCase().replace(/\s+/g, "")}`;
      finalMessage = `${toolTag} ${trimmedMessage}`;
    }

    const newMessage: ChatbotMessageType = {
      conversation_id: sessionID,
      prompt: finalMessage, // Use the combined message
      role: "user",
      document_category: selectedTool,
      file: selectedFiles.length > 0 ? selectedFiles : "",
    };

    // Update messages in store
    setMessages((prev) => [...prev, newMessage]);
    setThinking(true);
    setInputMessage("");
    // Reset selected tool and files after sending message
    // setSelectedTool("");
    setSelectedFiles([]);

    try {
      // Add thinking indicator
      setMessages((prev) => [
        ...prev,
        {
          conversation_id: sessionID,
          prompt: "",
          role: "ai",
          type: "thinking",
          ai_response: "Searching...",
        },
      ]);
      const form = new FormData();
      form.append("prompt", finalMessage);
      form.append("role", "user");
      form.append("document_category", selectedTool || "");
      form.append("conversation_id", sessionID || "");

      if (selectedFiles.length > 0) {
        // For now we're only supporting one file at a time
        const file = selectedFiles[0];
        form.append(`file`, file);

        // Check if this is an audio file and has a processing option
        const fileIndex = 0; // Since we're only using the first file
        const { isAudio } = getFileDetails(file);
        if (isAudio && audioProcessingOptions[fileIndex]) {
          form.append(
            "audioProcessingOption",
            audioProcessingOptions[fileIndex]
          );
        }
      }

      const botResponse = await chatbotChatHandler(form);

      let aiMessage = "";
      if (botResponse.status == 200) {
        setSessionID(botResponse?.data);
      }
      if (botResponse?.data?.message?.detail) {
        // Error case (like exceeded daily request limit)
        aiMessage = botResponse.data.message.detail;
      } else {
        // Normal success case
        aiMessage =
          botResponse?.data?.message?.prompt ||
          "Error! Sending message to chatbot. Please try again!";
      }

      setMessages((prev) => [
        ...prev.filter((msg) => msg.type !== "thinking"),
        {
          conversation_id: sessionID,
          role: "ai",
          ai_response: aiMessage,
          timestamp: new Date().toLocaleTimeString(),
        },
      ]);
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) => [
        ...prev.filter((msg) => msg.type !== "thinking"),
        {
          conversation_id: sessionID,
          role: "ai",
          ai_response: "Sorry, an error occurred. Please try again.",
          timestamp: new Date().toLocaleTimeString(),
        },
      ]);
    } finally {
      setThinking(false);
    }
  };

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setInputMessage(e.target.value);
    },
    [setInputMessage]
  );

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleToolSelect = (tool: string) => {
    setSelectedTool(tool);
    setShowTools(false);
    setTimeout(() => textareaRef.current?.focus(), 0);
  };

  const handleClearTool = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent the dropdown from opening
    setSelectedTool("");
  };

  const handleFilePreview = (file: File) => {
    setPreviewFile(file);
    setIsPreviewModalOpen(true);
  };

  const closePreviewModal = () => {
    setIsPreviewModalOpen(false);
    setPreviewFile(null);
  };

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

  // Handle file selection
  const handleFileSelection = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Check if we're exceeding the max number of files
    if (selectedFiles.length + files.length > MAX_FILES) {
      setFileError(`You can upload a maximum of ${MAX_FILES} files`);
      return;
    }

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
      setSelectedFiles((prevFiles) => [...prevFiles, ...validFiles]);
    }
  };

  // Handle files from drag and drop or file input
  const handleFiles = (files: FileList) => {
    if (!files || files.length === 0) return;

    // Check if we're exceeding the max number of files
    if (selectedFiles.length + files.length > MAX_FILES) {
      setFileError(`You can upload a maximum of ${MAX_FILES} files`);
      return;
    }

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
      setSelectedFiles((prevFiles) => [...prevFiles, ...validFiles]);
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

  // Voice recording functions
  const startRecording = async () => {
    try {
      // Request microphone permission
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Create a new MediaRecorder instance
      const recorder = new MediaRecorder(stream);
      setMediaRecorder(recorder);

      // Initialize recording state
      setIsRecording(true);
      setAudioChunks([]);
      setRecordingTime(0);

      // Start the timer
      intervalRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);

      // Handle data available event
      recorder.ondataavailable = (e) => {
        setAudioChunks((chunks) => [...chunks, e.data]);
      };

      // Handle recording stop
      recorder.onstop = () => {
        // Create a blob from all chunks
        const audioBlob = new Blob(audioChunks, { type: "audio/webm" });
        setAudioBlob(audioBlob);
        setTempAudioBlob(audioBlob);
        setTempStream(stream);

        // Show options modal instead of auto-saving
        setShowRecordingOptions(true);
      };

      // Start recording with 100ms chunks
      recorder.start(100);

      // Start speech recognition if enabled
      const newRecognition = initializeSpeechRecognition();
      if (newRecognition) {
        setRecognition(newRecognition);
        setIsTranscribing(true);
        newRecognition.start();
      }
    } catch (error) {
      console.error("Error accessing microphone:", error);
      setFileError("Could not access microphone. Please check permissions.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorder) {
      // Stop the recorder
      if (mediaRecorder.state !== "inactive") {
        mediaRecorder.stop();
      }
    }

    // Stop speech recognition if active
    if (recognition) {
      recognition.stop();
      setRecognition(null);
    }

    // Clear interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // Reset recording state
    setIsRecording(false);
    setMediaRecorder(null);
  };

  // Handle sending as audio file
  const handleSendAsAudio = () => {
    if (tempAudioBlob) {
      // Convert blob to file
      const audioFile = new File(
        [tempAudioBlob],
        `voice-message-${Date.now()}.webm`,
        { type: "audio/webm" }
      );

      // Add to selected files
      setSelectedFiles((prev) => [...prev, audioFile]);

      // Set default audio processing option
      setAudioProcessingOptions((prev) => ({
        ...prev,
        [selectedFiles.length]: "transcribe",
      }));
    }

    // Clean up
    if (tempStream) {
      tempStream.getTracks().forEach((track) => track.stop());
    }
    setShowRecordingOptions(false);
    setTempAudioBlob(null);
    setTempStream(null);
    setTranscription("");
  };

  // Handle sending as text
  const handleSendAsText = () => {
    // Add transcription to input field
    if (transcription) {
      setInputMessage((prev) => (prev ? prev + " " + transcription : transcription));
    }

    // Clean up
    if (tempStream) {
      tempStream.getTracks().forEach((track) => track.stop());
    }
    setShowRecordingOptions(false);
    setTempAudioBlob(null);
    setTempStream(null);
    setTranscription("");
    
    // Focus the input field
    setTimeout(() => textareaRef.current?.focus(), 0);
  };

  const cancelRecording = () => {
    if (mediaRecorder) {
      // Stop the recorder without saving
      if (mediaRecorder.state !== "inactive") {
        mediaRecorder.stop();
      }
    }

    // Stop speech recognition if active
    if (recognition) {
      recognition.stop();
      setRecognition(null);
    }

    // Clear interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // Clean up temp stream if it exists
    if (tempStream) {
      tempStream.getTracks().forEach((track) => track.stop());
    }

    // Reset state without saving the recording
    setIsRecording(false);
    setMediaRecorder(null);
    setAudioBlob(null);
    setAudioChunks([]);
    setTranscription("");
    setShowRecordingOptions(false);
    setTempAudioBlob(null);
    setTempStream(null);
  };

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
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
        color: "text-black bg-purple-100 border-purple-300",
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

  // Initialize speech recognition
  const initializeSpeechRecognition = () => {
    try {
      // Browser compatibility
      const SpeechRecognition =
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition;

      if (!SpeechRecognition) {
        console.error("Speech recognition not supported in this browser");
        setFileError("Speech recognition not supported in this browser");
        return null;
      }

      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US"; // Change to your language if needed

      recognition.onresult = (event: any) => {
        let interimTranscript = "";
        let finalTranscript = "";

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        setTranscription(finalTranscript || interimTranscript);
      };

      recognition.onerror = (event: any) => {
        console.error("Recognition error", event.error);
        setFileError(`Recognition error: ${event.error}`);
        setIsTranscribing(false);
      };

      recognition.onend = () => {
        setIsTranscribing(false);
      };

      return recognition;
    } catch (error) {
      console.error("Error initializing speech recognition:", error);
      setFileError("Could not initialize speech recognition");
      return null;
    }
  };

  return (
    <>
      <motion.div
        className=" sm:max-w-2xl lg:max-w-3xl mx-auto w-full px-4 sm:px-0 pb-4 pt-0"
        variants={sectionFadeInFromBottom}
        initial="initial"
        animate="animate"
      >
        <div
          className={`relative border rounded-xl shadow-md space-y-2 md:space-y-3 sm:space-y-0 px-3 py-2 sm:px-4 sm:py-0 transition-all duration-200 ${
            isDragOver
              ? "border-primary border-2 bg-blue-50"
              : "border-primary/30"
          }`}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          {/* Drag and Drop Overlay */}
          {isDragOver && (
            <div className="absolute inset-0 z-50 bg-blue-50/90 border-2 border-dashed border-[#228E98] rounded-xl flex items-center justify-center">
              <div className="text-center">
                <div className="text-4xl mb-2">📁</div>
                <div className="text-[#228E98] font-semibold">
                  Drop files here
                </div>
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

          {/* File Previews */}
          {selectedFiles.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-2 pb-1">
              {selectedFiles.map((file, index) => {
                const { icon, color, isImage } = getFileDetails(file);
                return (
                  <div
                    key={index}
                    className={`relative flex items-center ${color} border rounded-md px-2 py-1 text-sm cursor-pointer hover:opacity-80 transition-opacity`}
                    onClick={() => handleFilePreview(file)}
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
                              {audioProcessingOptions[index] ===
                                "send-as-is" && <Check size={12} />}
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
                              {audioProcessingOptions[index] ===
                                "transcribe" && <Check size={12} />}
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
                        setSelectedFiles((files) =>
                          files.filter((_, i) => i !== index)
                        );
                        if (selectedFiles.length === 1) {
                          setFileError(null);
                        }
                      }}
                      className="ml-1 hover:bg-gray-200 rounded-full p-0.5 z-10"
                      title="Remove file"
                    >
                      <X size={14} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* Mobile: Selected Tool as a Tab */}
          {isClient && isMobile && selectedTool && (
            <div className="absolute top-2 left-3 z-10 flex items-center bg-blue-50 text-[#228E98] text-sm px-3 py-1 rounded-full w-fit mb-2">
              @{selectedTool.toLowerCase().replace(/\s+/g, "")}
              <span
                className="ml-2 p-0.5 rounded-full hover:bg-blue-200 cursor-pointer"
                onClick={handleClearTool}
              >
                <X size={14} />
              </span>
            </div>
          )}
          {/* Textarea */}
          <textarea
            ref={textareaRef}
            autoFocus={true}
            value={inputMessage}
            onChange={handleInputChange}
            onKeyDown={handleKeyPress}
            className={`scroll-container bg-transparent w-full pt-1 resize-none overflow-y-scroll rounded-md ${
              isClient && isMobile && selectedTool ? "pt-12" : "pt-2"
            }`}
            style={{
              color: 'var(--color-text)',
              background: 'transparent',
              border: 'none',
              outline: 'none',
              boxShadow: 'none',
              caretColor: 'var(--color-primary)',
              transition: 'color 0.2s',
              scrollbarColor: 'var(--color-scrollbar-thumb) ',
              scrollbarWidth: 'thin',
            }}
            placeholder="Message..."
            rows={1}
            disabled={thinking}
          />

          {/* Action bar: Plus | Tools/SelectedTool | Mic | Send */}
          <div className="flex items-center justify-between gap-2 pb-2">
            {/* Plus Button */}
            <div className="relative">
              <button
                title="Upload file"
                style={{ background: 'var(--color-btn-bg)', color: 'var(--color-btn-text)' }}
                className="p-2 rounded-full"
                onClick={() =>
                  document.getElementById("chat-file-input")?.click()
                }
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

            {/* Tool Selector */}
            <div className="relative" ref={toolsRef}>
              {!selectedTool ? (
                <>
                  <button
                    onClick={() => setShowTools((prev) => !prev)}
                    style={{ background: 'var(--color-btn-bg)', color: 'var(--color-btn-text)' }}
                    className="p-2 text-sm rounded-full"
                    type="button"
                  >
                    <Settings2 size={18} />
                  </button>
                  {showTools && (
                    <div style={{ background: 'var(--color-card-bg)', color: 'var(--color-text)', border: '1px solid var(--color-border)', boxShadow: '0 2px 8px 0 var(--color-shadow)' }} className="absolute z-50 bottom-full mb-2 left-0 w-48 rounded-lg shadow-lg text-sm">
                      {tools.map((tool: any, index: number) => (
                        <div
                          key={index}
                          onClick={() => handleToolSelect(tool.href)}
                          style={{ borderRadius: '0.5rem', padding: '0.5rem 1rem', cursor: 'pointer', transition: 'background 0.2s' }}
                          className="hover:opacity-80"
                        >
                          {tool.icon} &nbsp;
                          {tool.title}
                        </div>
                      ))}
                    </div>
                  )}
                </>
              ) : !isClient || !isMobile ? (
                <div style={{ background: 'var(--color-accent-bg)', color: 'var(--color-accent-text)' }} className="flex items-center text-sm px-3 py-1 rounded-full w-fit">
                  @{selectedTool.toLowerCase().replace(/\s+/g, "")}
                  <span
                    className="ml-2 p-0.5 rounded-full hover:opacity-80 cursor-pointer"
                    onClick={handleClearTool}
                  >
                    <X size={14} />
                  </span>
                </div>
              ) : null}
            </div>
            <button
              title="Web Search"
              style={{ background: selectedTool == "websearch" ? 'var(--color-accent-bg)' : 'var(--color-btn-bg)', color: 'var(--color-btn-text)' }}
              className="p-2 rounded-full"
              onClick={() => handleToolSelect("websearch")}
              type="button"
            >
              <Globe size={18} />
            </button>

            {/* Spacer */}
            <div className="flex-1" />

            {/* Mic Button */}
            {isRecording ? (
              <div className="flex items-center gap-2">
                <div className="animate-pulse text-red-500 flex items-center">
                  <div className="w-2 h-2 rounded-full bg-red-500 mr-1"></div>
                  <span className="text-xs font-medium">
                    {formatTime(recordingTime)}
                  </span>
                </div>
                <button
                  onClick={stopRecording}
                  style={{ background: 'var(--color-success-bg)', color: 'var(--color-success-text)' }}
                  className="p-2 rounded-full"
                  type="button"
                  title="Stop recording"
                >
                  <Square size={14} />
                </button>
                <button
                  onClick={cancelRecording}
                  style={{ background: 'var(--color-error-bg)', color: 'var(--color-error-text)' }}
                  className="p-2 rounded-full"
                  type="button"
                  title="Cancel recording"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ) : (
              <button
                onClick={startRecording}
                style={{ background: 'var(--color-btn-bg)', color: 'var(--color-btn-text)' }}
                className="p-2 rounded-full"
                type="button"
                title="Record voice message"
              >
                <Mic size={18} />
              </button>
            )}

            {/* Send Button */}
            <button
              onClick={handleSendMessage}
              disabled={thinking}
              style={{ background: 'var(--color-primary-bg)', color: 'var(--color-primary-text)', opacity: thinking ? 0.5 : 1, transition: 'opacity 0.2s' }}
              className="p-2 rounded-full"
              type="button"
            >
              <Send size={18} />
            </button>
          </div>

          {/* File error message */}
          {fileError && (
            <div className="mt-2 text-red-500 text-sm">{fileError}</div>
          )}

          {/* Audio Processing Options */}
          {showAudioOptions !== null && (
            <div
              ref={audioOptionsRef}
              className="absolute z-50 bottom-full mb-2 right-0 w-48 bg-white border border-gray-300 rounded-lg shadow-lg text-sm text-gray-700"
            >
              <div className="px-4 py-2 font-semibold border-b">
                Audio Options
              </div>
              <div className="flex flex-col gap-1 p-2">
                <button
                  onClick={() => {
                    setAudioProcessingOptions((prev) => ({
                      ...prev,
                      [showAudioOptions]: "trim",
                    }));
                    setShowAudioOptions(null);
                  }}
                  className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-100 cursor-pointer"
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

          {/* Update the recording UI to show transcription */}
          {isRecording && (
            <div className="absolute left-0 right-0 top-0 bg-white p-3 z-10 border-b">
              <div className="flex items-center gap-2 mb-2">
                <div className="animate-pulse text-red-500 flex items-center">
                  <div className="w-2 h-2 rounded-full bg-red-500 mr-1"></div>
                  <span className="text-xs font-medium">
                    {formatTime(recordingTime)}
                  </span>
                </div>
                <div className="flex-1"></div>
                <button
                  onClick={stopRecording}
                  className="p-2 rounded-full text-white bg-green-500 hover:bg-green-600"
                  type="button"
                  title="Stop recording"
                >
                  <Square size={14} />
                </button>
                <button
                  onClick={cancelRecording}
                  className="p-2 rounded-full text-white bg-red-500 hover:bg-red-600"
                  type="button"
                  title="Cancel recording"
                >
                  <Trash2 size={14} />
                </button>
              </div>

              {/* Live transcription */}
              <div className="text-sm text-gray-700 italic min-h-5 max-h-15 overflow-y-auto">
                {transcription ? transcription : "Listening..."}
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Document Preview Modal */}
      <DocumentPreviewModal
        file={previewFile}
        isOpen={isPreviewModalOpen}
        onClose={closePreviewModal}
      />

      {/* Recording Options Modal */}
      {showRecordingOptions && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div
            ref={recordingOptionsRef}
            className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full mx-4"
          >
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              How would you like to send this?
            </h3>
            
            {/* Show transcription if available */}
            {transcription && (
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Transcription:</p>
                <p className="text-sm text-gray-800 italic">{transcription}</p>
              </div>
            )}

            <div className="flex flex-col gap-3">
              <button
                onClick={handleSendAsText}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-[#228E98] text-white rounded-lg hover:bg-[#1a7b85] transition-colors"
                disabled={!transcription}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                </svg>
                Send as Text
              </button>
              
              <button
                onClick={handleSendAsAudio}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path>
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                  <line x1="12" x2="12" y1="19" y2="22"></line>
                </svg>
                Send as Audio
              </button>

              <button
                onClick={() => {
                  if (tempStream) {
                    tempStream.getTracks().forEach((track) => track.stop());
                  }
                  setShowRecordingOptions(false);
                  setTempAudioBlob(null);
                  setTempStream(null);
                  setTranscription("");
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatbotInput;
