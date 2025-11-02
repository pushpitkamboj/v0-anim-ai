"use client"
import { Zap, Loader2, Sparkles } from "lucide-react"
import { useEffect, useState } from "react"

interface Message {
  id: string
  text: string
  timestamp: Date
  videoUrl?: string
  isResponse?: boolean
  isLoading?: boolean
}

interface MessageItemProps {
  message: Message
}

const LOADING_STAGES = [
  { text: "Analyzing your request...", duration: 5000 },
  { text: "Generating animation code...", duration: 15000 },
  { text: "Rendering your animation...", duration: 25000 },
  { text: "Almost there! Finalizing...", duration: 0 },
]

export default function MessageItem({ message }: MessageItemProps) {
  const [loadingStage, setLoadingStage] = useState(0)
  const [elapsedTime, setElapsedTime] = useState(0)

  useEffect(() => {
    if (!message.isLoading) return

    const startTime = Date.now()
    const timer = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTime) / 1000))
    }, 1000)

    let currentStage = 0
    const stageTimers: NodeJS.Timeout[] = []

    LOADING_STAGES.forEach((stage, index) => {
      if (stage.duration > 0) {
        const timeout = setTimeout(() => {
          if (currentStage < LOADING_STAGES.length - 1) {
            currentStage++
            setLoadingStage(currentStage)
          }
        }, stage.duration)
        stageTimers.push(timeout)
      }
    })

    return () => {
      clearInterval(timer)
      stageTimers.forEach((timeout) => clearTimeout(timeout))
    }
  }, [message.isLoading])

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const formatElapsedTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const handleOpenVideo = () => {
    if (message.videoUrl) {
      window.open(message.videoUrl, "_blank")
    }
  }

  return (
    <div className={`flex ${message.isResponse ? "justify-start" : "justify-end"} mb-4 animate-fade-in`}>
      <div
        className={`max-w-sm transition-all duration-300 ${
          message.isResponse
            ? "bg-white dark:bg-slate-800 border border-gray-200 dark:border-white/10 rounded-2xl px-5 py-3 shadow-md hover:shadow-lg"
            : "bg-black dark:bg-white border border-gray-900 dark:border-gray-100 rounded-2xl px-5 py-3 shadow-md hover:shadow-lg"
        }`}
      >
        <p
          className={`text-sm leading-relaxed font-medium ${
            message.isResponse ? "text-black dark:text-white" : "text-white dark:text-black"
          }`}
        >
          {message.text}
        </p>

        <p
          className={`text-xs mt-2 font-normal ${
            message.isResponse ? "text-gray-500 dark:text-gray-400" : "text-gray-400 dark:text-gray-600"
          }`}
        >
          {formatTime(message.timestamp)}
        </p>

        {message.isLoading && (
          <div className="mt-4 pt-3 border-t border-gray-300/50 dark:border-white/10">
            <div className="flex items-center gap-3 mb-3">
              <Loader2 className="w-4 h-4 animate-spin text-black dark:text-white" />
              <span className="text-gray-700 dark:text-gray-300 text-xs font-semibold">
                {LOADING_STAGES[loadingStage].text}
              </span>
            </div>

            <div className="space-y-2">
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-black dark:bg-white h-full rounded-full transition-all duration-1000 ease-linear"
                  style={{
                    width: `${Math.min((loadingStage / (LOADING_STAGES.length - 1)) * 100, 95)}%`,
                  }}
                />
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-600 dark:text-gray-400 font-medium">
                  Elapsed: {formatElapsedTime(elapsedTime)}
                </span>
                <span className="text-gray-600 dark:text-gray-400 font-medium">Est. 2-3 min</span>
              </div>
            </div>

            <div className="mt-3 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              <Sparkles className="w-3 h-3" />
              <span className="italic">Creating something amazing for you...</span>
            </div>
          </div>
        )}

        {message.isResponse && message.videoUrl && (
          <div className="mt-4 pt-3 border-t border-gray-300/50 dark:border-white/10">
            <p className="text-xs text-gray-700 dark:text-gray-300 mb-2 font-medium">Your animation is ready! 🎬</p>
            <button
              onClick={handleOpenVideo}
              className="inline-flex items-center gap-2 bg-black dark:bg-white hover:bg-gray-900 dark:hover:bg-gray-100 text-white dark:text-black px-4 py-2 rounded-xl transition-all text-xs font-semibold shadow-md hover:shadow-lg hover:scale-105 active:scale-95 duration-200"
            >
              <Zap size={14} strokeWidth={2} />
              Watch Animation
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
