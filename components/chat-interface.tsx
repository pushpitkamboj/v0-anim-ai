"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import MessageItem from "./message-item"
import { Send, Sparkles, Zap } from "lucide-react"

interface Message {
  id: string
  text: string
  timestamp: Date
  videoUrl?: string
  isResponse?: boolean
  isLoading?: boolean
}

interface ChatInterfaceProps {
  messages: Message[]
  onSendMessage: (message: string) => void
}

const EXAMPLE_PROMPTS = [
  {
    icon: "∑",
    text: "Visualize a spiral (r = a + bθ) growing outward",
  },
  {
    icon: "⚛",
    text: "Plot y = x² and y = √x on the same graph",
  },
  {
    icon: "●",
    text: "Show Lissajous curves (x = A sin at, y = B sin bt)",
  },
]

export default function ChatInterface({ messages, onSendMessage }: ChatInterfaceProps) {
  const [inputValue, setInputValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = async () => {
    if (!inputValue.trim()) return

    setIsLoading(true)
    const message = inputValue
    setInputValue("")

    try {
      await onSendMessage(message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleExampleClick = (promptText: string) => {
    setInputValue(promptText)
    setIsLoading(true)
    onSendMessage(promptText)
      .then(() => setIsLoading(false))
      .catch(() => setIsLoading(false))
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto flex flex-col items-center w-full px-3 sm:px-4">
        <div className="w-full max-w-3xl py-3 sm:py-4">
          {messages.length === 0 ? (
            <div className="flex items-start justify-start sm:justify-center h-full min-h-[250px] sm:min-h-[300px] mt-16 sm:mt-0">
              <div className="text-center max-w-2xl px-2">
                <div className="relative mb-3 sm:mb-4">
                  <div className="absolute inset-0 bg-gradient-to-br from-foreground/10 to-foreground/5 rounded-3xl blur-3xl" />
                  <div className="relative w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-foreground via-foreground/90 to-foreground/70 rounded-3xl flex items-center justify-center mx-auto shadow-2xl">
                    <Sparkles className="text-background" size={24} strokeWidth={2} />
                  </div>
                </div>

                <h1 className="text-foreground text-2xl sm:text-3xl font-black mb-1 tracking-tight">Vectora &nbsp; Studio</h1>
                <p className="text-muted-foreground text-sm sm:text-base mb-4 sm:mb-5 font-medium leading-relaxed max-w-lg mx-auto px-2">
                  Great Animations Take Time. Ours? Just 5 Mins.
                </p>

                <div className="space-y-2 sm:space-y-3 text-left bg-gradient-to-br from-muted/80 to-muted/40 p-3 sm:p-4 rounded-2xl sm:rounded-3xl border-2 border-border/50 shadow-lg backdrop-blur-sm">
                  <div className="flex items-center gap-2 mb-1 sm:mb-2">
                    <Zap className="text-foreground" size={14} strokeWidth={2.5} />
                    <p className="text-foreground text-[10px] sm:text-xs font-black uppercase tracking-widest">
                      Quick Start
                    </p>
                  </div>
                  <ul className="text-muted-foreground space-y-1.5 sm:space-y-2">
                    {EXAMPLE_PROMPTS.map((prompt, index) => (
                      <li
                        key={index}
                        onClick={() => handleExampleClick(prompt.text)}
                        className="flex items-center gap-2 sm:gap-4 p-2.5 sm:p-4 rounded-xl hover:bg-background/80 transition-all cursor-pointer group border border-transparent hover:border-border/50 hover:shadow-md"
                      >
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-foreground/5 rounded-lg flex items-center justify-center group-hover:bg-foreground/10 group-hover:scale-110 transition-all flex-shrink-0">
                          <span className="text-xl sm:text-2xl font-bold">{prompt.icon}</span>
                        </div>
                        <span className="font-semibold text-xs sm:text-base group-hover:text-foreground transition-colors flex-1 leading-tight">
                          {prompt.text}
                        </span>
                        <Send
                          className="text-muted-foreground/50 group-hover:text-foreground group-hover:translate-x-1 transition-all flex-shrink-0"
                          size={16}
                        />
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {messages.map((message) => (
                <div key={message.id} className="animate-fade-in">
                  <MessageItem message={message} />
                </div>
              ))}
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="border-t border-border/50 p-3 sm:p-4 bg-background/80 backdrop-blur-xl">
        <div className="flex gap-2 sm:gap-3 max-w-3xl mx-auto">
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Describe your animation…"
            className="flex-1 bg-muted/80 text-foreground placeholder-muted-foreground rounded-xl sm:rounded-2xl px-3 sm:px-5 py-3 sm:py-4 resize-none focus:outline-none focus:ring-2 focus:ring-foreground/20 border border-border/50 transition-all font-medium text-xs sm:text-sm shadow-sm hover:shadow-lg focus:shadow-lg hover:border-border focus:border-foreground/30"
            rows={2}
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !inputValue.trim()}
            className="bg-foreground hover:bg-foreground/90 disabled:opacity-50 disabled:cursor-not-allowed text-background rounded-xl sm:rounded-2xl px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-center transition-all font-bold shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 duration-200 disabled:hover:scale-100"
          >
            <Send size={18} strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </div>
  )
}
