"use client";
import { useRef, useState, useEffect } from "react";
import { X } from "lucide-react";

interface ToolSelectorProps {
  selectedTool: string | undefined;
  setSelectedTool: (tool: string) => void;
  tools: any[];
  messages: any[];
  isClient: boolean;
  isMobile: boolean;
}

const ToolSelector = ({ 
  selectedTool, 
  setSelectedTool, 
  tools, 
  messages,
  isClient,
  isMobile
}: ToolSelectorProps) => {
  const [showTools, setShowTools] = useState(false);
  const toolsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        toolsRef.current &&
        !toolsRef.current.contains(event.target as Node)
      ) {
        setShowTools(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleToolSelect = (tool: string) => {
    setSelectedTool(tool);
    setShowTools(false);
  };

  const handleClearTool = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent the dropdown from opening
    setSelectedTool("");
  };

  return (
    <div className="relative" ref={toolsRef}>
      {!selectedTool ? (
        <>
          <button
            onClick={() => setShowTools((prev) => !prev)}
            className="px-3 py-1 text-sm rounded-full transition-colors duration-200"
            style={{
              background: 'var(--color-input-bg)',
              color: 'var(--color-text)',
            }}
            type="button"
          >
            Tools
          </button>
          {showTools && (
            <div
              className={`absolute z-50 ${
                messages.length > 0
                  ? "bottom-full mb-2"
                  : "top-full mt-2"
              } left-0 w-48 rounded-lg shadow-lg text-sm transition-colors duration-200`}
              style={{
                background: 'var(--color-card-bg)',
                color: 'var(--color-text)',
                border: '1px solid var(--color-border)',
              }}
            >
              {tools.map((tool: any, index: number) => (
                <div
                  key={index}
                  onClick={() => handleToolSelect(tool.href)}
                  className="px-4 py-2 cursor-pointer transition-colors duration-200"
                  style={{
                    borderRadius: '0.5rem',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-input-bg)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  {tool.icon} &nbsp;
                  {tool.title}
                </div>
              ))}
            </div>
          )}
        </>
      ) : !isClient || !isMobile ? (
        <div
          className="flex items-center text-sm px-3 py-1 rounded-full w-fit transition-colors duration-200"
          style={{
            background: 'var(--color-input-bg)',
            color: 'var(--color-primary)',
          }}
        >
          @{selectedTool.toLowerCase().replace(/\s+/g, "")}
          <span
            className="ml-2 p-0.5 rounded-full cursor-pointer transition-colors duration-200"
            style={{ background: 'var(--color-card-bg)' }}
            onClick={handleClearTool}
          >
            <X size={14} />
          </span>
        </div>
      ) : null}
    </div>
  );
};

export default ToolSelector;
