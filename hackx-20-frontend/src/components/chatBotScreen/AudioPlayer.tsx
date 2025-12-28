"use client";
import { useState, useRef, useLayoutEffect } from "react";
import { Play, Pause, Volume2, VolumeX } from "lucide-react";

interface AudioPlayerProps {
  audioFile: File | string;
  theme?: string;
}

const AudioPlayer = ({ audioFile, theme = "light" }: AudioPlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [audioSrc, setAudioSrc] = useState<string>("");

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const progressBarRef = useRef<HTMLDivElement | null>(null);

  // Set audio source from File object or string URL
  useLayoutEffect(() => {
    if (!audioFile) return;
    const url =
      typeof audioFile === "string"
        ? audioFile
        : URL.createObjectURL(audioFile);

    const id = requestAnimationFrame(() => setAudioSrc(url));

    return () => {
      cancelAnimationFrame(id);
      if (typeof audioFile !== "string") URL.revokeObjectURL(url);
    };
  }, [audioFile]);

  // Load metadata when audio is loaded
  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  // Update time display as audio plays
  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  // Toggle play/pause
  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  // Toggle mute
  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  // Seek to position when clicking on progress bar
  const seek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (progressBarRef.current && audioRef.current) {
      const rect = progressBarRef.current.getBoundingClientRect();
      const pos = (e.clientX - rect.left) / rect.width;
      audioRef.current.currentTime = pos * duration;
    }
  };

  // Format time in MM:SS
  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  // Handle audio end
  const handleEnded = () => {
    setIsPlaying(false);
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      setCurrentTime(0);
    }
  };

  // Background and text colors based on theme
  // Use theme CSS variables for dark/light mode
  const bgClass = '';
  const textClass = '';
  const progressBgClass = '';
  const progressFillClass = '';

  // Get filename to display
  const getDisplayName = () => {
    if (typeof audioFile === "string") {
      return "Voice Message";
    }
    return audioFile.name.split("/").pop() || "Voice Message";
  };

  return (
    <div
      className={`p-3 rounded-lg flex flex-col w-full max-w-xs transition-colors duration-300`}
      style={{ background: 'var(--color-input-bg)', color: 'var(--color-text)' }}
    >
      {/* Hidden audio element */}
      <audio
        ref={audioRef}
        src={audioSrc}
        onLoadedMetadata={handleLoadedMetadata}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
      />

      {/* File name and duration */}
      <div className={`flex justify-between items-center mb-2`} style={{ color: 'var(--color-text)' }}>
        <div className="text-sm font-medium truncate max-w-37.5">
          {getDisplayName()}
        </div>
        <div className="text-xs">
          {formatTime(currentTime)} / {formatTime(duration)}
        </div>
      </div>

      {/* Progress bar */}
      <div
        ref={progressBarRef}
        className={`h-1.5 rounded-full mb-2 cursor-pointer transition-colors duration-300`}
        style={{ background: 'var(--color-border)' }}
        onClick={seek}
      >
        <div
          className={`h-full rounded-full transition-colors duration-300`}
          style={{ width: `${(currentTime / duration) * 100 || 0}%`, background: 'var(--color-primary)' }}
        />
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        <button
          onClick={togglePlay}
          className={`p-2 rounded-full hover:bg-opacity-10 hover:bg-gray-500 ${textClass}`}
        >
          {isPlaying ? <Pause size={18} /> : <Play size={18} />}
        </button>

        <button
          onClick={toggleMute}
          className={`p-2 rounded-full hover:bg-opacity-10 hover:bg-gray-500 ${textClass}`}
        >
          {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
        </button>
      </div>
    </div>
  );
};

export default AudioPlayer;
