"use client"

import { useState, useEffect } from "react"
import TopBar from "@/components/top-bar"
import { Button } from "@/components/ui/button"
import { Play, Sparkles } from "lucide-react"
import Link from "next/link"

interface GalleryVideo {
  prompt: string
  video_url: string
  created_at: string
}

export default function GalleryPage() {
  const [videos, setVideos] = useState<GalleryVideo[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedVideo, setSelectedVideo] = useState<GalleryVideo | null>(null)

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const response = await fetch("/api/gallery")
        const data = await response.json()

        if (data.success) {
          setVideos(data.videos)
        }
      } catch (error) {
        console.error("[v0] Error fetching gallery:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchVideos()
  }, [])

  return (
    <div className="min-h-screen bg-background">
      <TopBar showAuth={true} />

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-foreground/5 rounded-full border border-border mb-4">
            <Sparkles size={16} className="text-foreground" />
            <span className="text-sm font-semibold text-foreground">Community Showcase</span>
          </div>
          <h1 className="text-5xl font-black text-foreground tracking-tight">
            Explore Amazing{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-foreground to-foreground/60">
              Animations
            </span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Discover stunning scientific visualizations created by our community. Get inspired and create your own.
          </p>
          <Button asChild size="lg" className="mt-6 font-semibold shadow-lg hover:shadow-xl transition-all">
            <Link href="/">Create Your Animation</Link>
          </Button>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <div className="text-muted-foreground">Loading gallery...</div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && videos.length === 0 && (
          <div className="text-center py-20">
            <p className="text-muted-foreground mb-4">No animations yet. Be the first to create one!</p>
            <Button asChild>
              <Link href="/">Get Started</Link>
            </Button>
          </div>
        )}

        {/* Gallery Grid */}
        {!isLoading && videos.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {videos.map((video, index) => (
              <div
                key={index}
                className="group relative bg-card border border-border rounded-2xl overflow-hidden hover:shadow-2xl hover:border-foreground/20 transition-all duration-300 cursor-pointer"
                onClick={() => setSelectedVideo(video)}
              >
                {/* Video Preview */}
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

                {/* Prompt */}
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
        )}
      </div>

      {/* Video Modal */}
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
