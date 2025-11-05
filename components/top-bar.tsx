"use client"

import { FaGithub } from "react-icons/fa"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Sparkles, Menu } from "lucide-react"

interface TopBarProps {
  showAuth?: boolean
  onMenuClick?: () => void
  showMenuButton?: boolean
}

export default function TopBar({ showAuth = true, onMenuClick, showMenuButton = false }: TopBarProps) {
  return (
    <div className="bg-background/80 backdrop-blur-xl border-b border-border px-3 sm:px-6 py-3 sm:py-4 flex items-center justify-between sticky top-0 z-50">
      <div className="flex items-center gap-2 sm:gap-3">
        {showMenuButton && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuClick}
            className="lg:hidden h-9 w-9 hover:bg-muted"
            aria-label="Toggle sidebar"
          >
            <Menu className="h-5 w-5" />
          </Button>
        )}

        <Link href="/" className="flex items-center gap-2 sm:gap-3 group">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-foreground to-foreground/60 rounded-xl blur-sm opacity-50 group-hover:opacity-70 transition-opacity" />
            <div className="relative w-9 h-9 sm:w-11 sm:h-11 bg-gradient-to-br from-foreground to-foreground/80 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
              <Sparkles className="text-background" size={18} strokeWidth={2.5} />
            </div>
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-foreground tracking-tight group-hover:tracking-normal transition-all">
              VertexAI
            </h1>
            <p className="text-[9px] sm:text-[10px] text-muted-foreground font-bold uppercase tracking-wider hidden xs:block">
              Math • Physics • Chemistry
            </p>
          </div>
        </Link>
      </div>

      {/* Right Side Content */}
      <div className="flex items-center gap-2 sm:gap-3">
        {showAuth && (
          <div className="flex items-center gap-1.5 sm:gap-2">
            <Button asChild variant="ghost" size="sm" className="font-semibold text-xs sm:text-sm px-2 sm:px-4">
              <Link href="/auth/login">Login</Link>
            </Button>
            <Button
              asChild
              size="sm"
              className="font-semibold shadow-sm hover:shadow-md transition-shadow text-xs sm:text-sm px-2 sm:px-4"
            >
              <Link href="/auth/sign-up">Sign Up</Link>
            </Button>
          </div>
        )}

        <a
          href="https://github.com/pushpitkamboj/AnimAI"
          target="_blank"
          rel="noopener noreferrer"
          className="text-muted-foreground hover:text-foreground transition-all duration-300 hover:scale-110 p-1.5 sm:p-2 rounded-lg hover:bg-muted"
          aria-label="View VertexAI on GitHub"
        >
          <FaGithub size={18} className="sm:w-5 sm:h-5" />
        </a>
      </div>
    </div>
  )
}
