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
import ThemeToggle from "@/components/ThemeToggle";

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
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        color: 'var(--color-sidebar-text)',
        background: 'transparent',
        fontSize: '1.125rem',
        fontWeight: 500,
        borderRadius: '0.5rem',
        padding: '0.75rem 0',
        transition: 'background 0.2s, color 0.2s',
        width: '100%',
      }}
    >
      <span style={{ color: 'var(--color-sidebar-icon)' }}>{icon}</span>
      <span style={{ color: 'var(--color-sidebar-text)', fontWeight: 500 }}>{label}</span>
    </button>
  ) : (
    <Link
      href={href}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        color: 'var(--color-sidebar-text)',
        background: 'transparent',
        fontSize: '1.125rem',
        fontWeight: 500,
        borderRadius: '0.5rem',
        padding: '0.75rem 0',
        transition: 'background 0.2s, color 0.2s',
      }}
    >
      <span style={{ color: 'var(--color-sidebar-icon)' }}>{icon}</span>
      <span style={{ color: 'var(--color-sidebar-text)', fontWeight: 500 }}>{label}</span>
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
          className="lg:hidden fixed top-8 left-4 sm:left-8 z-50 p-2 rounded-md backdrop-blur-sm transition-colors"
          style={{ background: 'var(--color-primary)', color: 'var(--color-text)' }}
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
          fixed inset-y-0 left-0 w-[300px] px-4 py-8 z-40 flex flex-col
          transition-transform duration-300 ease-in-out overflow-y-auto
          ${isMobileMenuOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"}
          
          lg:relative lg:translate-x-0 lg:shadow-none
          lg:w-[260px] lg:h-[calc(100vh-16px)]
          rounded-[0.7rem] lg:mt-2 lg:ml-[5px] lg:inset-auto
          xl:w-[270px]
        `}
        style={{ backgroundColor: 'var(--background)', border: '1px solid var(--color-border)' }}
      >
        {/* Header with Close and Theme Toggle */}
        <div className="flex items-center justify-between mb-6">
          <Link
            href="/cl/chatscreen"
            className="flex items-center flex-1"
            onClick={handleLinkClick}
          >
            <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ background: 'var(--color-card-bg)' }}>
              <Image
                src="/chatlegis.svg"
                alt="Reglo Logo"
                width={50}
                height={10}
              />
            </div>
            <span className="text-xl font-semibold ml-4" style={{ color: 'var(--color-primary)' }}>
              Chat Legis
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button
              className="lg:hidden p-2 rounded transition-colors"
              style={{ background: 'var(--color-input-bg)' }}
              onClick={() => setIsMobileMenuOpen(false)}
              aria-label="Close sidebar"
            >
              <X size={28} style={{ color: 'var(--color-text)' }} />
            </button>
          </div>
        </div>

        <nav className="flex-grow space-y-2">
          {sidebarNavItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              onClick={handleLinkClick}
              className={`flex items-center justify-between rounded-lg transition-colors
                p-2 text-sm
                xl:p-3 xl:text-base`}
              style={{
                backgroundColor: isActive(item.href) ? 'var(--color-input-bg)' : 'transparent',
                color: 'var(--color-text)',
              }}
            >
              <div className="flex items-center space-x-2 xl:space-x-3" style={{ color: 'var(--color-text)' }}>
                {item.icon}
                <span>{item.label}</span>
              </div>
              <ChevronRight size={20} style={{ color: 'var(--color-text)' }} />
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
