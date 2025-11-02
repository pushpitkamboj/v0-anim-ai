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
    text: "Draw y = sin(x) from -π to π",
  },
  {
    icon: "⚛",
    text: "Visualize electron orbits in a hydrogen atom",
  },
  {
    icon: "●",
    text: "Show a rotating cube on plane centered at origin",
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
      <div className="flex-1 overflow-y-auto flex flex-col items-center w-full px-4">
        <div className="w-full max-w-3xl py-8">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full min-h-[400px]">
              <div className="text-center max-w-2xl">
                <div className="relative mb-6">
                  <div className="absolute inset-0 bg-gradient-to-br from-foreground/10 to-foreground/5 rounded-3xl blur-3xl" />
                  <div className="relative w-20 h-20 bg-gradient-to-br from-foreground via-foreground/90 to-foreground/70 rounded-3xl flex items-center justify-center mx-auto shadow-2xl">
                    <Sparkles className="text-background" size={40} strokeWidth={2} />
                  </div>
                </div>

                <h1 className="text-foreground text-4xl font-black mb-2 tracking-tight">AnimAI Studio</h1>
                <p className="text-muted-foreground text-base mb-8 font-medium leading-relaxed max-w-lg mx-auto">
                  Great Animations Take Time. Ours? Just 5 Mins.
                </p>

                <div className="space-y-4 text-left bg-gradient-to-br from-muted/80 to-muted/40 p-6 rounded-3xl border-2 border-border/50 shadow-lg backdrop-blur-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <Zap className="text-foreground" size={16} strokeWidth={2.5} />
                    <p className="text-foreground text-xs font-black uppercase tracking-widest">Quick Start</p>
                  </div>
                  <ul className="text-muted-foreground space-y-3">
                    {EXAMPLE_PROMPTS.map((prompt, index) => (
                      <li
                        key={index}
                        onClick={() => handleExampleClick(prompt.text)}
                        className="flex items-center gap-4 p-5 rounded-xl hover:bg-background/80 transition-all cursor-pointer group border border-transparent hover:border-border/50 hover:shadow-md"
                      >
                        <div className="w-12 h-12 bg-foreground/5 rounded-lg flex items-center justify-center group-hover:bg-foreground/10 group-hover:scale-110 transition-all flex-shrink-0">
                          <span className="text-3xl font-bold">{prompt.icon}</span>
                        </div>
                        <span className="font-semibold text-base group-hover:text-foreground transition-colors flex-1">
                          {prompt.text}
                        </span>
                        <Send
                          className="text-muted-foreground/50 group-hover:text-foreground group-hover:translate-x-1 transition-all flex-shrink-0"
                          size={18}
                        />
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
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

      <div className="border-t border-border/50 p-6 bg-background/80 backdrop-blur-xl">
        <div className="flex gap-3 max-w-3xl mx-auto">
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Describe your animation… (e.g., 'Draw y = sin(x)' or 'Visualize a pendulum')"
            className="flex-1 bg-muted/80 text-foreground placeholder-muted-foreground rounded-2xl px-5 py-4 resize-none focus:outline-none focus:ring-2 focus:ring-foreground/20 border border-border/50 transition-all font-medium text-sm shadow-sm hover:shadow-lg focus:shadow-lg hover:border-border focus:border-foreground/30"
            rows={2}
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !inputValue.trim()}
            className="bg-foreground hover:bg-foreground/90 disabled:opacity-50 disabled:cursor-not-allowed text-background rounded-2xl px-6 py-4 flex items-center justify-center transition-all font-bold shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 duration-200 disabled:hover:scale-100"
          >
            <Send size={20} strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </div>
  )
}
