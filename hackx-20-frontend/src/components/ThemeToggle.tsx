"use client";
import { useTheme } from "./ThemeProvider";
import { Moon, Sun } from "lucide-react";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-full transition-all duration-300 hover:scale-110"
      style={{
        backgroundColor: theme === "light" ? "#f3f4f6" : "#27272a",
      }}
      aria-label="Toggle theme"
    >
      {theme === "light" ? (
        <Moon size={20} className="text-gray-700" />
      ) : (
        <Sun size={20} className="text-yellow-400" />
      )}
    </button>
  );
}
