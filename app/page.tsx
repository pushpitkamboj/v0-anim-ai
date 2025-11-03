"use client"

import { useState, useEffect } from "react"
import TopBar from "../components/top-bar"
import ChatInterface from "../components/chat-interface"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { fetchWithTimeout } from "@/lib/fetch-with-timeout"
import { Play, Sparkles } from "lucide-react"

interface Message {
  id: string
  text: string
  timestamp: Date
  videoUrl?: string
  isResponse?: boolean
  isLoading?: boolean
  isError?: boolean
}

interface GalleryVideo {
  prompt: string
  video_url: string
  created_at: string
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([])
  const [isHydrated, setIsHydrated] = useState(false)
  const [showLoginPrompt, setShowLoginPrompt] = useState(false)
  const [galleryVideos, setGalleryVideos] = useState<GalleryVideo[]>([])
  const [selectedVideo, setSelectedVideo] = useState<GalleryVideo | null>(null)
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

    const fetchGallery = async () => {
      try {
        const response = await fetch("/api/gallery")
        const data = await response.json()
        if (data.success) {
          setGalleryVideos(data.videos)
        }
      } catch (error) {
        console.error("[v0] Error fetching gallery:", error)
      }
    }
    fetchGallery()
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

      <div className="flex-1 overflow-y-auto relative z-10">
        <div className="h-screen flex flex-col">
          <div className="flex-1 overflow-hidden">
            <ChatInterface messages={messages} onSendMessage={handleSendMessage} />
          </div>
        </div>

        {galleryVideos.length > 0 && (
          <div className="border-t border-border bg-muted/30">
            <div className="max-w-7xl mx-auto px-6 py-16">
              <div className="text-center mb-12">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-foreground/5 rounded-full border border-border mb-4">
                  <Sparkles size={16} className="text-foreground" />
                  <span className="text-sm font-semibold text-foreground">Community Showcase</span>
                </div>
                <h2 className="text-4xl font-black text-foreground tracking-tight mb-3">
                  Explore Amazing{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-foreground to-foreground/60">
                    Animations
                  </span>
                </h2>
                <p className="text-base text-muted-foreground max-w-2xl mx-auto">
                  Discover stunning scientific visualizations created by our community
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {galleryVideos.slice(0, 6).map((video, index) => (
                  <div
                    key={index}
                    className="group relative bg-card border border-border rounded-2xl overflow-hidden hover:shadow-2xl hover:border-foreground/20 transition-all duration-300 cursor-pointer"
                    onClick={() => setSelectedVideo(video)}
                  >
                    <div className="aspect-video bg-muted relative overflow-hidden">
                      <video
                        src={video.video_url}
                        className="w-full h-full object-cover"
                        muted
                        loop
                        playsInline
                        onMouseEnter={(e) => e.currentTarget.play()}
                        onMouseLeave={(e) => {
                          e.currentTarget.pause()
                          e.currentTarget.currentTime = 0
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center backdrop-blur-sm">
                          <Play size={24} className="text-black ml-1" fill="black" />
                        </div>
                      </div>
                    </div>

                    <div className="p-4">
                      <p className="text-sm font-medium text-foreground line-clamp-2 group-hover:text-foreground/80 transition-colors">
                        {video.prompt}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {new Date(video.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {selectedVideo && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6"
          onClick={() => setSelectedVideo(null)}
        >
          <div
            className="bg-background rounded-2xl max-w-4xl w-full overflow-hidden border border-border shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="aspect-video bg-black">
              <video src={selectedVideo.video_url} controls autoPlay className="w-full h-full" />
            </div>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-foreground mb-2">{selectedVideo.prompt}</h3>
              <p className="text-sm text-muted-foreground">
                Created on {new Date(selectedVideo.created_at).toLocaleDateString()}
              </p>
              <Button onClick={() => setSelectedVideo(null)} variant="outline" className="mt-4">
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
