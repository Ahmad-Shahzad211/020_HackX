"use client";
import { useState, useEffect } from "react";

interface TypewriterEffectProps {
  text: string;
  speed?: number;
  showCursor?: boolean;
  cursorChar?: string;
  className?: string;
}

const TypewriterEffect = ({ 
  text, 
  speed = 40, 
  showCursor = true, 
  cursorChar = "|",
  className = ""
}: TypewriterEffectProps) => {
  const [displayedText, setDisplayedText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showCursorBlink, setShowCursorBlink] = useState(true);

  useEffect(() => {
    // Reset when text changes
    setDisplayedText("");
    setCurrentIndex(0);
  }, [text]);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText(text.slice(0, currentIndex + 1));
        setCurrentIndex(currentIndex + 1);
      }, speed);

      return () => clearTimeout(timeout);
    }
  }, [currentIndex, text, speed]);

  useEffect(() => {
    // Cursor blinking effect
    const cursorInterval = setInterval(() => {
      setShowCursorBlink(prev => !prev);
    }, 500);

    return () => clearInterval(cursorInterval);
  }, []);

  return (
    <span className={className}>
      {displayedText}
      {showCursor && (
        <span 
          className={`ml-1 ${showCursorBlink ? 'opacity-100' : 'opacity-0'} transition-opacity duration-100`}
          style={{ color: '#228E98' }}
        >
          {cursorChar}
        </span>
      )}
    </span>
  );
};

export default TypewriterEffect;
