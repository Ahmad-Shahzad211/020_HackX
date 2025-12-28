"use client";

import Link from "next/link";
import { ChevronRight, ArrowLeftFromLine, Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { UAParser } from "ua-parser-js";
import { logoutHandler } from "@/handlers/regloHandler";
import { sidebarNavItems } from "@/data/constant";
import { SidebarItemProps } from "@/types";
import Image from "next/image";
import { getLocation } from "@/utils/clientUtils";

function SidebarItem({ icon, label, href }: SidebarItemProps) {
  const route = useRouter();

  const handleLogout = async () => {
    const resp = await getLocation();

    const userAgent = navigator.userAgent;
    const devices = UAParser(userAgent);

    const userDetails = {
      ipAddress: resp.ip,
      browser: devices.browser.name,
      browserVersion: devices.browser.version,
      osName: devices.os.name,
    };
    try {
      const resp = await logoutHandler(userDetails);
      if (resp.status == 200) {
        localStorage.clear();
        route.push("/auth/login");
      }
    } catch (error: any) {
      console.log(`error: ${error.message}`);
    }
  };
  return label.toLowerCase() === "logout" ? (
    <button
      onClick={handleLogout}
      className="flex items-center space-x-4 text-white hover:bg-white/10 px-4 py-3 rounded-lg text-lg transition w-full"
    >
      <span className="text-white/100">{icon}</span>
      <span className="font-medium">{label}</span>
    </button>
  ) : (
    <Link
      href={href}
      className="flex items-center space-x-4 text-white hover:bg-white/10 px-4 py-3 rounded-lg text-lg transition"
    >
      <span className="text-white/100">{icon}</span>
      <span className="font-medium">{label}</span>
    </Link>
  );
}

export default function ProfileSidebar() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === "/cl/settings/profile") {
      return pathname.startsWith("/cl/settings/profile");
    }
    return pathname === href;
  };

  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? "hidden" : "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobileMenuOpen]);

  const handleLinkClick = () => {
    if (window.innerWidth < 1024) {
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <>
      {/* Hamburger button: only show if drawer is closed and screen is < 1024px */}
      {!isMobileMenuOpen && (
        <button
          className="lg:hidden fixed top-8 left-4 sm:left-8 z-50 p-2 bg-gradient-primary text-white rounded-md backdrop-blur-sm hover:bg-white/20 transition-colors"
          onClick={() => setIsMobileMenuOpen(true)}
          aria-label="Open sidebar"
        >
          <Menu size={24} />
        </button>
      )}

      {/* Overlay for drawer (only on small to medium screens) */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/40 z-30"
          onClick={() => setIsMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 w-[300px] px-4 py-8 z-40 bg-gradient-primary text-white flex flex-col
          transition-transform duration-300 ease-in-out overflow-y-auto
          ${isMobileMenuOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"}
          
          lg:relative lg:translate-x-0 lg:shadow-none
          lg:w-[260px] lg:h-[calc(100vh-16px)]
          rounded-[0.7rem] lg:mt-2 lg:ml-[5px] lg:inset-auto
          xl:w-[270px]
        `}
      >
        {/* Close button for drawer */}
        <button
          className="lg:hidden absolute top-5 right-5 p-1 text-white hover:bg-white/20 rounded-full transition-colors"
          onClick={() => setIsMobileMenuOpen(false)}
          aria-label="Close sidebar"
        >
          <X size={22} />
        </button>

        <Link
          href="/cl/chatscreen"
          className="mb-10 block"
          onClick={handleLinkClick}
        >
          <div className="flex items-center">
            <div className="w-12 h-12  rounded-lg flex items-center justify-center">
              <Link href="/">
                <Image
                  src="/chatlegis.svg"
                  alt="Reglo Logo"
                  width={50}
                  height={10}
                />
              </Link>
            </div>
            <span className="text-white text-xl font-semibold ml-4">
              Chat Legis
            </span>
          </div>
        </Link>

        <nav className="flex-grow space-y-2">
          {sidebarNavItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              onClick={handleLinkClick}
              className={`flex items-center justify-between rounded-lg hover:bg-white/20 transition-colors
                p-2 text-sm
                xl:p-3 xl:text-base
                ${isActive(item.href) ? "bg-white/20" : ""}`}
            >
              <div className="flex items-center space-x-2 xl:space-x-3">
                {item.icon}
                <span>{item.label}</span>
              </div>
              <ChevronRight size={20} />
            </Link>
          ))}
        </nav>

        <div className="mt-auto pt-4">
          <SidebarItem
            icon={<ArrowLeftFromLine size={20} />}
            label="Logout"
            href="/logout"
          />
        </div>
      </aside>
    </>
  );
}
