"use client";
import {
  FileText,
  FileImage,
  FileAudio,
  FileVideo,
  File,
  Mic,
  Archive,
  FileJson,
  Presentation,
} from "lucide-react";

interface FileIconProps {
  fileName: string;
  fileType?: string;
  size?: number;
}

const FileIcon = ({ fileName, fileType, size = 18 }: FileIconProps) => {
  // Get the file extension from the name
  const getFileExtension = (name: string): string => {
    return name.split(".").pop()?.toLowerCase() || "";
  };
  
  // Determine if this is a voice recording
  const isVoiceRecording = () => {
    if (fileType === "audio/voice") return true;
    if (fileType?.includes("audio/") && fileName.includes("voice-message")) return true;
    if (fileName.includes("voice-message") && getFileExtension(fileName) === "webm") return true;
    if (fileName.includes("recording") && ["webm", "wav", "mp3", "ogg"].includes(getFileExtension(fileName))) return true;
    return false;
  };

  // Use file extension to determine the appropriate icon
  const renderIcon = () => {
    // Check for voice recording first
    if (isVoiceRecording()) {
      return <Mic size={size} />;
    }
    
    const extension = getFileExtension(fileName);
    
    // Image files
    if (["jpg", "jpeg", "png", "gif", "bmp", "webp", "svg"].includes(extension)) {
      return <FileImage size={size} />;
    }
    
    // PDF files
    if (extension === "pdf") {
      return <FileText size={size} />; // Using FileText for PDF
    }
    
    // Audio files
    if (["mp3", "wav", "ogg", "m4a", "flac", "aac"].includes(extension)) {
      return <FileAudio size={size} />;
    }
    
    // Video files
    if (["mp4", "webm", "avi", "mov", "wmv", "mkv", "flv"].includes(extension)) {
      return <FileVideo size={size} />;
    }
    
    // Code files
    if (["js", "ts", "jsx", "tsx", "html", "css", "php", "py", "java", "cpp", "c", "go", "rb", "swift"].includes(extension)) {
      return <FileText size={size} />; // Using FileText for code
    }
    
    // Spreadsheet files
    if (["xls", "xlsx", "csv", "ods"].includes(extension)) {
      return <FileText size={size} />; // Using FileText for spreadsheets
    }
    
    // Presentation files
    if (["ppt", "pptx", "odp"].includes(extension)) {
      return <Presentation size={size} />;
    }
    
    // Archive files
    if (["zip", "rar", "7z", "tar", "gz"].includes(extension)) {
      return <Archive size={size} />;
    }
    
    // Document files
    if (["doc", "docx", "txt", "rtf", "odt"].includes(extension)) {
      return <FileText size={size} />;
    }
    
    // Data files
    if (["json", "xml", "yaml", "yml"].includes(extension)) {
      return <FileJson size={size} />;
    }
    
    // Default file icon for anything else
    return <File size={size} />;
  };

  return renderIcon();
};

export default FileIcon;
