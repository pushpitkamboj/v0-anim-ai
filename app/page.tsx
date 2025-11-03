"use client"

import { useState, useEffect } from "react"
import TopBar from "../components/top-bar"
import ChatInterface from "../components/chat-interface"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
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

const GALLERY_VIDEOS = [
  {
    prompt: "Draw the equation of SHM",
    video_url:
      "https://pub-b215a097b7b243dc86da838a88d50339.r2.dev/media/videos/SimpleHarmonicMotionGraph/480p15/SimpleHarmonicMotionGraph.mp4",
  },
  {
    prompt: "Draw y = sin(x) from -π to π",
    video_url:
      "https://pub-b215a097b7b243dc86da838a88d50339.r2.dev/media/videos/SineCurveWithKeyPoints/480p15/SineCurveWithKeyPoints.mp4",
  },
  {
    prompt: "Visualize Electron Orbits in a Hydrogen Atom",
    video_url:
      "https://pub-b215a097b7b243dc86da838a88d50339.r2.dev/media/videos/HydrogenAtomOrbits/480p15/HydrogenAtomOrbits.mp4",
  },
  {
    prompt: "Plot a 3D spiral curve expanding along the z-axis",
    video_url:
      "https://pub-b215a097b7b243dc86da838a88d50339.r2.dev/media/videos/Spiral3DScene/480p15/Spiral3DScene.mp4",
  },
  {
    prompt: "Describe a Tangent to the Circle",
    video_url:
      "https://pub-b215a097b7b243dc86da838a88d50339.r2.dev/media/videos/TangentToCircleScene/480p15/TangentToCircleScene.mp4",
  },
  {
    prompt: "Derive the Formula for Thales Theorem",
    video_url:
      "https://pub-b215a097b7b243dc86da838a88d50339.r2.dev/media/videos/ThalesTheoremDerivation/480p15/ThalesTheoremDerivation.mp4",
  },
]

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([])
  const [isHydrated, setIsHydrated] = useState(false)
  const [showLoginPrompt, setShowLoginPrompt] = useState(false)
  const [selectedVideo, setSelectedVideo] = useState<{ prompt: string; video_url: string } | null>(null)
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
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt: message }),
      })

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
    <div className="flex flex-col min-h-screen bg-background">
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

      <div className="flex-1">
        <div className="min-h-screen flex flex-col">
          <ChatInterface messages={messages} onSendMessage={handleSendMessage} />
        </div>

        <div className="border-t border-border bg-background">
          <div className="max-w-7xl mx-auto px-6 py-20">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-foreground/5 rounded-full border border-border mb-6">
                <Sparkles size={16} className="text-foreground" />
                <span className="text-sm font-semibold text-foreground">Gallery</span>
              </div>
              <h2 className="text-5xl font-black text-foreground tracking-tight mb-4">
                Explore Amazing{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-foreground to-foreground/60">
                  Animations
                </span>
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Discover stunning scientific visualizations created by our community
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {GALLERY_VIDEOS.map((video, index) => (
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

                  <div className="p-5">
                    <p className="text-sm font-semibold text-foreground line-clamp-2 group-hover:text-foreground/80 transition-colors">
                      {video.prompt}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
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
              <h3 className="text-lg font-semibold text-foreground mb-4">{selectedVideo.prompt}</h3>
              <Button onClick={() => setSelectedVideo(null)} variant="outline">
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
