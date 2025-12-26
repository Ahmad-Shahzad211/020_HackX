"use client";
import { navigationItems } from "@/data/constant";
import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";

const PRIMARY_COLOR = "#228E98";
const PRIMARY_COLOR_HOVER = "#1b7078";

export default function Navigation() {
  return (
    <header className="w-full py-4 sm:py-4 md:py-6 sticky top-0 z-50">
      <div className="container mx-auto flex items-center justify-center px-2 sm:px-4 md:px-6 lg:px-8">
        <nav className="bg-[var(--color-nav-bg)] shadow-lg rounded-full justify-center py-1.5 sm:py-2.5 px-2 sm:px-8 sm:gap-2 flex flex-nowrap items-center md:space-x-3 border border-[var(--color-border)] w-fit transition-colors duration-300">
          {navigationItems.map((navLink, index) => (
            <Link
              key={index}
              href={navLink.href}
              className="p-1 sm:py-1.5 text-xs sm:text-sm md:text-base text-[var(--color-text)] hover:text-white rounded-full hover:px-3 ease-in-out transition-all duration-200 font-medium"
              style={{
                ['--hover-bg' as string]: PRIMARY_COLOR,
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = PRIMARY_COLOR}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              {navLink.title}
            </Link>
          ))}

          <div className="w-px h-5 lg:h-6 bg-[var(--color-border)] mx-1 md:mx-2"></div>
          
          {/* Theme Toggle */}
          <div className="flex items-center px-1">
            <ThemeToggle />
          </div>
          
          <div className="w-px h-5 lg:h-6 bg-[var(--color-border)] mx-1 md:mx-2"></div>
          
          <Link
            href="/auth/login"
            style={{ backgroundColor: PRIMARY_COLOR }}
            className="text-white font-medium px-2 sm:px-3 py-1 sm:py-1.5 md:px-4 md:py-2 lg:px-6 rounded-full text-xs sm:text-sm md:text-base lg:text-lg transition-colors shadow-md hover:shadow-lg hover:bg-[#1b7078]"
          >
            Login
          </Link>
          <Link
            href="/auth/register"
            className="text-[var(--color-text)] hover:text-[var(--color-primary)] font-medium px-2 sm:px-3 py-1 sm:py-1.5 md:px-3 md:py-2 lg:px-4 rounded-full text-xs sm:text-sm md:text-base lg:text-lg transition-colors border border-[var(--color-border)] hover:border-[var(--color-primary)] hover:bg-[var(--color-card-bg)]"
          >
            Signup
          </Link>
        </nav>
      </div>
    </header>
  );
}
