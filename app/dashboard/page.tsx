"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import ChatInterface from "@/components/chat-interface"
import ChatHistorySidebar from "@/components/chat-history-sidebar"
import TopBar from "@/components/top-bar"
import { createClient } from "@/lib/supabase/client"
import {
  createChatSession,
  getChatSessions,
  getChatMessages,
  saveChatMessage,
  deleteChatSession,
  updateChatSessionTitle,
} from "@/app/actions/chat"

interface Message {
  id: string
  text: string
  timestamp: Date
  videoUrl?: string
  isResponse?: boolean
  isLoading?: boolean
  isError?: boolean
}

export default function DashboardPage() {
  const [sessions, setSessions] = useState<any[]>([])
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const initializeUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push("/auth/login")
        return
      }

      setUser(user)

      // Get user profile
      const { data: profileData } = await supabase.from("profiles").select("*").eq("id", user.id).single()

      setProfile(profileData)

      // Load chat sessions
      const sessionsData = await getChatSessions()
      setSessions(sessionsData)

      // If there are sessions, load the most recent one
      if (sessionsData.length > 0) {
        const latestSession = sessionsData[0]
        setCurrentSessionId(latestSession.id)
        await loadMessages(latestSession.id)
      } else {
        // Create a new session if none exist
        const newSession = await createChatSession()
        setSessions([newSession])
        setCurrentSessionId(newSession.id)
      }

      setIsLoading(false)
    }

    initializeUser()
  }, [])

  const loadMessages = async (sessionId: string) => {
    const messagesData = await getChatMessages(sessionId)
    const formattedMessages = messagesData.map((msg: any) => ({
      id: msg.id,
      text: msg.text,
      timestamp: new Date(msg.created_at),
      videoUrl: msg.video_url,
      isResponse: msg.is_response,
      isError: msg.is_error,
    }))
    setMessages(formattedMessages)
  }

  const handleNewChat = async () => {
    const newSession = await createChatSession()
    setSessions([newSession, ...sessions])
    setCurrentSessionId(newSession.id)
    setMessages([])
  }

  const handleSelectSession = async (sessionId: string) => {
    setCurrentSessionId(sessionId)
    await loadMessages(sessionId)
  }

  const handleDeleteSession = async (sessionId: string) => {
    await deleteChatSession(sessionId)
    const updatedSessions = sessions.filter((s) => s.id !== sessionId)
    setSessions(updatedSessions)

    if (currentSessionId === sessionId) {
      if (updatedSessions.length > 0) {
        setCurrentSessionId(updatedSessions[0].id)
        await loadMessages(updatedSessions[0].id)
      } else {
        const newSession = await createChatSession()
        setSessions([newSession])
        setCurrentSessionId(newSession.id)
        setMessages([])
      }
    }
  }

  const handleSendMessage = async (message: string) => {
    if (!currentSessionId) return

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: message,
      timestamp: new Date(),
      isResponse: false,
    }
    setMessages((prev) => [...prev, userMessage])

    // Save user message to database
    await saveChatMessage(currentSessionId, message, undefined, false, false)

    const isFirstMessage = messages.filter((m) => !m.isResponse).length === 0
    if (isFirstMessage) {
      const sessionTitle = message.slice(0, 50) + (message.length > 50 ? "..." : "")
      await updateChatSessionTitle(currentSessionId, sessionTitle)
      const updatedSessions = sessions.map((s) => (s.id === currentSessionId ? { ...s, title: sessionTitle } : s))
      setSessions(updatedSessions)
    }

    // Add loading message
    const loadingMessageId = (Date.now() + 1).toString()
    const initialLoadingMessage: Message = {
      id: loadingMessageId,
      text: "Analyzing your request...",
      timestamp: new Date(),
      isResponse: true,
      isLoading: true,
    }
    setMessages((prev) => [...prev, initialLoadingMessage])

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt: message }),
      })

      if (!response.ok) {
        throw new Error(`API returned status ${response.status}`)
      }

      const data = await response.json()

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

        // Save error message to database
        await saveChatMessage(currentSessionId, data.error || "An error occurred", undefined, true, true)
        return
      }

      const responseText = data.text || "Your animation has been generated successfully!"
      const responseMessage: Message = {
        id: loadingMessageId,
        text: responseText,
        videoUrl: data.videoUrl,
        timestamp: new Date(),
        isResponse: true,
        isLoading: false,
      }
      setMessages((prev) => prev.map((msg) => (msg.id === loadingMessageId ? responseMessage : msg)))

      // Save response to database
      await saveChatMessage(currentSessionId, responseText, data.videoUrl, true, false)
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

      await saveChatMessage(
        currentSessionId,
        "Failed to process your request. Please try again.",
        undefined,
        true,
        true,
      )
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-screen bg-background">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-muted-foreground">Loading...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-background">
      <ChatHistorySidebar
        sessions={sessions}
        currentSessionId={currentSessionId || undefined}
        onNewChat={handleNewChat}
        onSelectSession={handleSelectSession}
        onDeleteSession={handleDeleteSession}
        userEmail={user?.email}
        subscriptionTier={profile?.subscription_tier}
      />
      <div className="flex-1 flex flex-col">
        <TopBar showAuth={false} />
        <div className="flex-1 overflow-hidden">
          <ChatInterface messages={messages} onSendMessage={handleSendMessage} />
        </div>
      </div>
    </div>
  )
}
