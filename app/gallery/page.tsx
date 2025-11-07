"use client"

import { Sparkles, Play } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useState } from "react"

const GALLERY_ITEMS = [
  {
    title: "Draw the equation of SHM",
    videoUrl:
      "https://pub-b215a097b7b243dc86da838a88d50339.r2.dev/media/videos/SimpleHarmonicMotionGraph/480p15/SimpleHarmonicMotionGraph.mp4",
    date: "2024-01-15",
  },
  {
    title: "Plot a 3D spiral curve expanding along the z-axis",
    videoUrl: "https://pub-b215a097b7b243dc86da838a88d50339.r2.dev/media/videos/Spiral3DScene/480p15/Spiral3DScene.mp4",
    date: "2024-01-14",
  },
  {
    title: "Derive the Formula for Thales Theorem",
    videoUrl:
      "https://pub-b215a097b7b243dc86da838a88d50339.r2.dev/media/videos/ThalesTheoremDerivation/480p15/ThalesTheoremDerivation.mp4",
    date: "2024-01-13",
  },
  {
    title: "Draw y = x^3 Plot",
    videoUrl:
      "https://pub-b215a097b7b243dc86da838a88d50339.r2.dev/media/videos/CubicFunctionPlot/480p15/CubicFunctionPlot.mp4",
    date: "2024-01-12",
  },
  {
    title: "Particle System",
    videoUrl: "PASTE_VIDEO_URL_HERE_5",
    date: "2024-01-11",
  },
  {
    title: "Fractal Geometry",
    videoUrl: "PASTE_VIDEO_URL_HERE_6",
    date: "2024-01-10",
  },
]

export default function GalleryPage() {
  const [selectedVideo, setSelectedVideo] = useState<{ title: string; url: string } | null>(null)

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="border-b border-border bg-gradient-to-b from-background to-muted/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-2 bg-muted px-4 py-2 rounded-full text-sm font-medium">
              <Sparkles className="w-4 h-4" />
              <span>Community Gallery</span>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-foreground tracking-tight">
              Explore Amazing Animations
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
              Discover stunning mathematical and scientific visualizations created by our community
            </p>
          </div>
        </div>
      </div>

      {/* Gallery Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        {GALLERY_ITEMS && GALLERY_ITEMS.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {GALLERY_ITEMS.map((item, index) => (
              <div
                key={index}
                className="group relative bg-card rounded-2xl overflow-hidden border border-border hover:border-foreground/20 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 cursor-pointer"
                onClick={() => setSelectedVideo({ title: item.title, url: item.videoUrl })}
              >
                {/* Video Container */}
                <div className="relative aspect-video bg-muted">
                  <video
                    src={item.videoUrl}
                    className="w-full h-full object-cover"
                    loop
                    muted
                    playsInline
                    onMouseEnter={(e) => e.currentTarget.play()}
                    onMouseLeave={(e) => {
                      e.currentTarget.pause()
                      e.currentTarget.currentTime = 0
                    }}
                  />

                  {/* Play Overlay */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <div className="bg-foreground/90 rounded-full p-4">
                      <Play className="w-8 h-8 text-background fill-background" />
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 sm:p-5">
                  <p className="text-sm sm:text-base font-medium text-foreground line-clamp-2 mb-3">{item.title}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">{new Date(item.date).toLocaleDateString()}</span>
                    <a
                      href={item.videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-semibold text-foreground hover:underline"
                    >
                      View Full
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
              <Sparkles className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-bold mb-2">No animations yet</h3>
            <p className="text-muted-foreground mb-6">Be the first to create an amazing animation!</p>
            <Button asChild>
              <Link href="/">Start Creating</Link>
            </Button>
          </div>
        )}
      </div>

      {/* CTA Section */}
      <div className="border-t border-border bg-muted/20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">Create Your Own Animation</h2>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Transform your ideas into stunning visual animations. Start creating today and join our community of
            creators.
          </p>
          <Button asChild size="lg" className="font-semibold">
            <Link href="/">Get Started</Link>
          </Button>
        </div>
      </div>

      {selectedVideo && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm"
          onClick={() => setSelectedVideo(null)}
        >
          <div
            className="relative w-full max-w-4xl aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <video src={selectedVideo.url} autoPlay controls className="w-full h-full" />
            <button
              onClick={() => setSelectedVideo(null)}
              className="absolute top-4 right-4 bg-black/50 hover:bg-black/80 text-white rounded-full p-2 transition-all"
            >
              <span className="text-2xl">✕</span>
            </button>
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
              <p className="text-white font-semibold text-lg">{selectedVideo.title}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
