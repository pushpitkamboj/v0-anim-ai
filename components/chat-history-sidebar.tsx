"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { MessageSquare, Plus, Trash2, LogOut, Sparkles, Clock } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface ChatSession {
  id: string
  title: string
  created_at: string
  updated_at: string
}

interface ChatHistorySidebarProps {
  sessions: ChatSession[]
  currentSessionId?: string
  onNewChat: () => void
  onSelectSession: (sessionId: string) => void
  onDeleteSession: (sessionId: string) => void
  userEmail?: string
  subscriptionTier?: string
}

export default function ChatHistorySidebar({
  sessions,
  currentSessionId,
  onNewChat,
  onSelectSession,
  onDeleteSession,
  userEmail,
  subscriptionTier = "free",
}: ChatHistorySidebarProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [sessionToDelete, setSessionToDelete] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/")
    router.refresh()
  }

  const handleDeleteClick = (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setSessionToDelete(sessionId)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = () => {
    if (sessionToDelete) {
      onDeleteSession(sessionToDelete)
      setSessionToDelete(null)
    }
    setDeleteDialogOpen(false)
  }

  const getTierBadgeColor = () => {
    switch (subscriptionTier) {
      case "pro":
        return "bg-gradient-to-r from-blue-500 to-blue-600 text-white"
      case "team":
        return "bg-gradient-to-r from-purple-500 to-purple-600 text-white"
      case "enterprise":
        return "bg-gradient-to-r from-amber-500 to-amber-600 text-white"
      default:
        return "bg-black text-white"
    }
  }

  const getTierIcon = () => {
    switch (subscriptionTier) {
      case "pro":
      case "team":
      case "enterprise":
        return <Sparkles className="h-3 w-3" />
      default:
        return null
    }
  }

  return (
    <>
      <div className="w-64 sm:w-72 bg-gradient-to-b from-card to-card/95 border-r border-border flex flex-col h-full shadow-lg">
        {/* Header Section with Branding */}
        <div className="p-3 sm:p-4 border-b border-border bg-gradient-to-r from-primary/5 to-primary/10">
          <div className="flex items-center gap-2 mb-2 sm:mb-3">
            <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-primary to-primary/80 rounded-lg flex items-center justify-center shadow-sm">
              <Sparkles className="text-primary-foreground" size={14} />
            </div>
            <div>
              <h2 className="text-xs sm:text-sm font-bold text-foreground">VertexAI Studio</h2>
              <p className="text-[10px] sm:text-xs text-muted-foreground">Your Workspace</p>
            </div>
          </div>
          <Button
            onClick={onNewChat}
            className="w-full shadow-sm hover:shadow-md transition-all text-xs sm:text-sm"
            size="sm"
          >
            <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
            New Chat
          </Button>
        </div>

        {/* Chat History Section */}
        <div className="flex-1 flex flex-col min-h-0">
          <div className="px-3 sm:px-4 py-2 sm:py-3 border-b border-border/50">
            <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              <Clock className="h-3 w-3" />
              Recent Chats
            </div>
          </div>
          <ScrollArea className="flex-1 p-2 sm:p-3">
            <div className="space-y-1">
              {sessions.length === 0 ? (
                <div className="text-center py-6 sm:py-8 px-3 sm:px-4">
                  <MessageSquare className="h-6 w-6 sm:h-8 sm:w-8 text-muted-foreground/50 mx-auto mb-2" />
                  <p className="text-[10px] sm:text-xs text-muted-foreground">No chats yet</p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground/70 mt-1">Start a new conversation</p>
                </div>
              ) : (
                sessions.map((session) => (
                  <div
                    key={session.id}
                    className={`group flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg cursor-pointer transition-all ${
                      currentSessionId === session.id
                        ? "bg-primary/10 border border-primary/20 shadow-sm"
                        : "hover:bg-accent/50 border border-transparent"
                    }`}
                    onClick={() => onSelectSession(session.id)}
                  >
                    <div
                      className={`p-1 sm:p-1.5 rounded-md flex-shrink-0 ${currentSessionId === session.id ? "bg-primary/20" : "bg-muted"}`}
                    >
                      <MessageSquare className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                    </div>
                    <span className="text-xs sm:text-sm font-medium truncate flex-1 min-w-0">{session.title}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 sm:h-7 sm:w-7 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/10 hover:text-destructive"
                      onClick={(e) => handleDeleteClick(session.id, e)}
                    >
                      <Trash2 className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </div>

        {/* User Profile Section */}
        <div className="p-3 sm:p-4 border-t border-border bg-gradient-to-r from-muted/30 to-muted/50 space-y-2 sm:space-y-3">
          {/* Subscription Badge */}
          <div className="flex items-center justify-between">
            <div
              className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-[10px] sm:text-xs font-bold flex items-center gap-1 sm:gap-1.5 ${getTierBadgeColor()} shadow-sm`}
            >
              {getTierIcon()}
              {subscriptionTier.toUpperCase()}
            </div>
            {sessions.length > 0 && (
              <div className="text-[10px] sm:text-xs text-muted-foreground font-medium">
                {sessions.length} chat{sessions.length !== 1 ? "s" : ""}
              </div>
            )}
          </div>

          {/* User Email */}
          <div className="bg-background/50 rounded-lg p-2 sm:p-2.5 border border-border/50">
            <p className="text-[10px] sm:text-xs text-muted-foreground font-medium truncate">{userEmail}</p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-1.5 sm:space-y-2">
            {subscriptionTier === "free" && (
              <Button
                asChild
                variant="default"
                size="sm"
                className="w-full bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-sm hover:shadow-md transition-all text-xs"
              >
                <Link href="/pricing">
                  <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                  Upgrade Plan
                </Link>
              </Button>
            )}
            <Button
              onClick={handleLogout}
              variant="outline"
              size="sm"
              className="w-full hover:bg-destructive/10 hover:text-destructive hover:border-destructive/20 transition-all bg-transparent text-xs"
            >
              <LogOut className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Chat Session</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this chat session? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
