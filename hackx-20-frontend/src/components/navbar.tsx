import React from "react";
import { PanelRight } from "lucide-react";
import Image from "next/image";

interface NavbarProps {
  toggleSidebar?: () => void;
  isSidebarOpen?: boolean;
}

export default function Navbar({ toggleSidebar, isSidebarOpen }: NavbarProps) {
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return (
    <div className="mb-0 bg-blur-sm">
      {/* Top section with drawer and diamond */}
      <div className="flex justify-between items-center md:px-1 px-3">
        {/* Left - Drawer Button */}
        {(!isSidebarOpen || !isMobile) && (
          <button
            onClick={toggleSidebar}
            className={`p-2 rounded-lg transition-colors ${
              !isSidebarOpen ? "text-[#228E98]" : "text-neutral-500"
            }`}
            aria-label="Open sidebar"
          >
            <PanelRight
              size={24}
              className={`${
                !isSidebarOpen ? "text-neutral-500" : "text-[#228E98]"
              } transition-colors`}
            />
          </button>
        )}
      </div>
    </div>
  );
}
