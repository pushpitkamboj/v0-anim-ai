"use client"

import { useState, useEffect } from "react"
import TopBar from "../components/top-bar"
import ChatInterface from "../components/chat-interface"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { fetchWithTimeout } from "@/lib/fetch-with-timeout"

interface Message {
  id: string
  text: string
  timestamp: Date
  videoUrl?: string
  isResponse?: boolean
  isLoading?: boolean
  isError?: boolean
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([])
  const [isHydrated, setIsHydrated] = useState(false)
  const [showLoginPrompt, setShowLoginPrompt] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user) {
        router.push("/dashboard")
        return
      }
    }
    checkUser()

    setIsHydrated(true)
  }, [])

  useEffect(() => {
    const userMessages = messages.filter((m) => !m.isResponse)
    if (userMessages.length >= 3) {
      setShowLoginPrompt(true)
    }
  }, [messages])

  const handleSendMessage = async (message: string) => {
    console.log("[v0] handleSendMessage called with:", message)

    const userMessage: Message = {
      id: Date.now().toString(),
      text: message,
      timestamp: new Date(),
      isResponse: false,
    }
    setMessages((prev) => [...prev, userMessage])

    const loadingMessageId = (Date.now() + 1).toString()
    const initialLoadingMessage: Message = {
      id: loadingMessageId,
      text: "Thinking...",
      timestamp: new Date(),
      isResponse: true,
      isLoading: true,
    }
    setMessages((prev) => [...prev, initialLoadingMessage])

    try {
      console.log("[v0] Calling API route...")
      const response = await fetchWithTimeout(
        "/api/generate",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ prompt: message }),
        },
        600000, // 10 minutes
      )

      console.log("[v0] API response status:", response.status)

      if (!response.ok) {
        throw new Error(`API returned status ${response.status}`)
      }

      const data = await response.json()
      console.log("[v0] API response data:", data)

      if (!data.success) {
        const errorMessage: Message = {
          id: loadingMessageId,
          text: data.error || "An error occurred",
          timestamp: new Date(),
          isResponse: true,
          isLoading: false,
          isError: true,
        }
        setMessages((prev) => prev.map((msg) => (msg.id === loadingMessageId ? errorMessage : msg)))
        return
      }

      const responseMessage: Message = {
        id: loadingMessageId,
        text: data.text || "Your animation has been generated successfully!",
        videoUrl: data.videoUrl,
        timestamp: new Date(),
        isResponse: true,
        isLoading: false,
      }

      setMessages((prev) => prev.map((msg) => (msg.id === loadingMessageId ? responseMessage : msg)))
    } catch (error) {
      console.error("[v0] Error sending message:", error)
      const errorMessage: Message = {
        id: loadingMessageId,
        text: "Failed to process your request. Please try again.",
        timestamp: new Date(),
        isResponse: true,
        isLoading: false,
        isError: true,
      }
      setMessages((prev) => prev.map((msg) => (msg.id === loadingMessageId ? errorMessage : msg)))
    }
  }

  if (!isHydrated) {
    return (
      <div className="flex flex-col h-screen bg-background">
        <TopBar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-muted-foreground">Loading...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen bg-background relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.02] pointer-events-none" />

      <TopBar showAuth={true} />

      {showLoginPrompt && (
        <div className="bg-foreground text-background px-4 py-3 text-center relative z-10 border-b border-border">
          <p className="text-sm font-semibold">
            Want to save your chat history?{" "}
            <Button
              asChild
              variant="secondary"
              size="sm"
              className="ml-2 bg-background text-foreground hover:bg-background/90"
            >
              <Link href="/auth/sign-up">Sign up for free</Link>
            </Button>
          </p>
        </div>
      )}

      <div className="flex-1 overflow-hidden relative z-10">
        <ChatInterface messages={messages} onSendMessage={handleSendMessage} />
      </div>
    </div>
  )
}
