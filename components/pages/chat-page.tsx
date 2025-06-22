"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Send, Bot, User, Sparkles, TrendingUp, Youtube, Globe, DollarSign } from "lucide-react"
import { useMonthlyRevenue } from "@/hooks/use-monthly-revenue"
import { useYouTubeData } from "@/hooks/use-youtube-data"

interface Message {
  id: string
  content: string
  role: "user" | "assistant"
  timestamp: Date
  suggestions?: string[]
}

const SUGGESTED_QUESTIONS = [
  "What's my best performing YouTube video?",
  "How much revenue did I make last month?",
  "Which country generates the most leads?",
  "What's my overall conversion rate?",
  "Show me my top 3 revenue sources",
  "How are my YouTube engagement rates?",
]

const AI_RESPONSES = {
  "best performing video": {
    content: `Your best performing video is "Office Tour | A Day in the Life of a Software Engineer in NYC" with 50,475 views and $95,000 in attributed revenue. That's an impressive $1.88 revenue per view! 🏆

This video significantly outperformed others because it shows your personal success story and lifestyle, which builds trust and credibility with potential clients.`,
    suggestions: [
      "How can I create more lifestyle content?",
      "What makes this video so effective?",
      "Show me other high-performing videos",
    ],
  },
  "revenue last month": {
    content: `In June 2025, you generated $145,200 in total cash collected - your best month yet! 📈

Breakdown:
• PIF Revenue: $75,000 (52%)
• Installment Revenue: $27,000 (19%)
• Recurring Revenue: $43,200 (29%)

This represents a 13% increase from May. Your AI Agency Setup packages are really taking off!`,
    suggestions: ["What drove this growth?", "How can I maintain this momentum?", "Show me the revenue trend"],
  },
  "country leads": {
    content: `The United States generates the most leads by far:

🇺🇸 United States: 154 leads (62%)
🇨🇦 Canada: 45 leads (18%)
🇬🇧 United Kingdom: 26 leads (10%)
🇦🇺 Australia: 9 leads (4%)
🇩🇪 Germany: 6 leads (2%)

Your content resonates strongly with English-speaking markets, especially North America.`,
    suggestions: [
      "How can I expand to other markets?",
      "What's the conversion rate by country?",
      "Should I create localized content?",
    ],
  },
  "conversion rate": {
    content: `Your overall funnel conversion rates are exceptional:

📊 **Conversion Funnel:**
• View to Click: 3.6% (Industry avg: 2-3%)
• Click to Call: 2.4% (Industry avg: 1-2%)
• Call to Show: 86% (Industry avg: 70-80%)
• Show to Close: 28% (Industry avg: 15-25%)

Your show-up rate and close rate are particularly impressive! This indicates strong lead qualification and sales skills.`,
    suggestions: [
      "How can I improve my view-to-click rate?",
      "What's my average deal size?",
      "Show me conversion by traffic source",
    ],
  },
  "top revenue sources": {
    content: `Your top 3 revenue sources are:

🥇 **Office Tour Video**: $95,000 (23% of total)
🥈 **AI Developer Roadmap**: $82,500 (20% of total)  
🥉 **AI Agency Setup Program**: $72,000 (17% of total)

These three sources account for 60% of your total revenue. The pattern shows that personal branding content + educational roadmaps perform best.`,
    suggestions: [
      "How can I scale these successful formats?",
      "What other personal content should I create?",
      "Show me the full revenue breakdown",
    ],
  },
  "youtube engagement": {
    content: `Your YouTube engagement rates are strong:

📈 **Engagement Metrics:**
• Average Views: 14,157 per video
• Average Likes: 658 per video (4.6% engagement)
• Average Comments: 41 per video
• Total Channel Views: 212,355
• Total Likes: 9,873

Your "Office Tour" and "AI Roadmap" videos have the highest engagement rates. Personal story content gets 2x more engagement than pure tutorials.`,
    suggestions: [
      "Which videos should I promote more?",
      "How can I increase my comment engagement?",
      "What content gets the most likes?",
    ],
  },
}

export function ChatPage() {
  const { data: monthlyRevenue, loading: revenueLoading, error: revenueError } = useMonthlyRevenue()
  const { data: youtubeVideos, loading: youtubeLoading, error: youtubeError } = useYouTubeData()
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content:
        "Hi! I'm your AI assistant. I can help you analyze your coaching business data, YouTube performance, and sales metrics. What would you like to know?",
      role: "assistant",
      timestamp: new Date(),
      suggestions: SUGGESTED_QUESTIONS.slice(0, 3),
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  const loading = revenueLoading || youtubeLoading
  const error = revenueError || youtubeError

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector("[data-radix-scroll-area-viewport]")
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight
      }
    }
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const generateResponse = (userMessage: string): { content: string; suggestions?: string[] } => {
    const message = userMessage.toLowerCase()

    // Simple keyword matching for demo purposes
    if (message.includes("best") && (message.includes("video") || message.includes("youtube"))) {
      return AI_RESPONSES["best performing video"]
    }
    if (message.includes("revenue") && (message.includes("last month") || message.includes("june"))) {
      return AI_RESPONSES["revenue last month"]
    }
    if (message.includes("country") || message.includes("countries")) {
      return AI_RESPONSES["country leads"]
    }
    if (message.includes("conversion") && message.includes("rate")) {
      return AI_RESPONSES["conversion rate"]
    }
    if (message.includes("top") && message.includes("revenue")) {
      return AI_RESPONSES["top revenue sources"]
    }
    if (message.includes("youtube") && message.includes("engagement")) {
      return AI_RESPONSES["youtube engagement"]
    }

    // Default response with data insights
    const totalRevenue = monthlyRevenue.reduce((sum, month) => sum + month.total_cash_collected, 0)
    const bestMonth = monthlyRevenue.reduce((max, month) => 
      month.total_cash_collected > max.total_cash_collected ? month : max
    )
    const totalViews = youtubeVideos.reduce((sum, video) => sum + video.viewCount, 0)
    
    return {
      content: `I can help you analyze your coaching business data! Here are some key insights:

📊 **Quick Stats:**
• Total Revenue: $${totalRevenue.toLocaleString()} (last ${monthlyRevenue.length} months)
• Best Month: ${new Date(bestMonth.month + "-01").toLocaleDateString("en-US", { month: "long", year: "numeric" })} ($${bestMonth.total_cash_collected.toLocaleString()})
• Total YouTube Views: ${totalViews.toLocaleString()}
• Conversion Rate: 28% (show to close)

What specific aspect would you like to explore?`,
      suggestions: SUGGESTED_QUESTIONS.slice(0, 4),
    }
  }

  const handleSend = async () => {
    if (!input.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      role: "user",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    // Simulate AI processing delay
    setTimeout(() => {
      const response = generateResponse(input)
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: response.content,
        role: "assistant",
        timestamp: new Date(),
        suggestions: response.suggestions,
      }

      setMessages((prev) => [...prev, aiMessage])
      setIsLoading(false)
    }, 1500)
  }

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  if (loading) {
    return (
      <div className="space-y-4 sm:space-y-6 h-full">
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold">Chat with AI</h1>
            <Badge variant="secondary" className="badge-purple">
              <Sparkles className="h-3 w-3 mr-1" />
              Beta
            </Badge>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 sm:gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-3 sm:p-4">
                <div className="h-4 w-24 bg-muted animate-pulse rounded mb-2" />
                <div className="h-6 w-16 bg-muted animate-pulse rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-4 sm:space-y-6 h-full">
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold">Chat with AI</h1>
            <Badge variant="secondary" className="badge-purple">
              <Sparkles className="h-3 w-3 mr-1" />
              Beta
            </Badge>
          </div>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-muted-foreground">
              <p>Error loading chat data: {error}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6 h-full">
      <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
        <div className="flex items-center gap-2">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold">Chat with AI</h1>
          <Badge variant="secondary" className="badge-purple">
            <Sparkles className="h-3 w-3 mr-1" />
            Beta
          </Badge>
        </div>
      </div>

      {/* Quick Stats Cards - Responsive with Tailwind v4 */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 sm:gap-4">
        <Card className="bg-gradient-blue">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2">
              <Youtube className="h-4 w-4 text-info shrink-0" />
              <span className="text-xs sm:text-sm font-medium truncate">YouTube Views</span>
            </div>
            <div className="text-lg sm:text-xl font-bold text-info">
              {youtubeVideos.reduce((sum, video) => sum + video.viewCount, 0).toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-green">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-success shrink-0" />
              <span className="text-xs sm:text-sm font-medium truncate">Total Revenue</span>
            </div>
            <div className="text-lg sm:text-xl font-bold text-success">
              ${monthlyRevenue.reduce((sum, month) => sum + month.total_cash_collected, 0).toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-purple">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-purple shrink-0" />
              <span className="text-xs sm:text-sm font-medium truncate">Website Visitors</span>
            </div>
            <div className="text-lg sm:text-xl font-bold text-purple">
              {monthlyRevenue.reduce((sum, month) => sum + month.unique_website_visitors, 0).toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-orange">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-warning shrink-0" />
              <span className="text-xs sm:text-sm font-medium truncate">Conversion Rate</span>
            </div>
            <div className="text-lg sm:text-xl font-bold text-warning">28%</div>
          </CardContent>
        </Card>
      </div>

      {/* Chat Interface - Tailwind v4 Optimized */}
      <Card className="flex-1 flex flex-col min-h-0">
        <CardHeader className="pb-3 sm:pb-4 border-b border-border">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Bot className="h-4 w-4 sm:h-5 sm:w-5 text-purple" />
            AI Data Assistant
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col p-0">
          <ScrollArea className="flex-1 px-3 sm:px-6 scrollbar-thin" ref={scrollAreaRef}>
            <div className="space-y-3 sm:space-y-4 pb-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-2 sm:gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {message.role === "assistant" && (
                    <Avatar className="h-6 w-6 sm:h-8 sm:w-8 bg-purple-subtle shrink-0">
                      <AvatarFallback>
                        <Bot className="h-3 w-3 sm:h-4 sm:w-4 text-purple" />
                      </AvatarFallback>
                    </Avatar>
                  )}

                  <div className="flex-1 max-w-[80%] sm:max-w-[70%]">
                    <div
                      className={`rounded-lg px-3 py-2 sm:px-4 ${
                        message.role === "user"
                          ? "bg-primary text-primary-foreground ml-auto"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      <div className="whitespace-pre-wrap text-xs sm:text-sm">{message.content}</div>
                    </div>

                    {message.suggestions && (
                      <div className="mt-2 flex flex-wrap gap-1 sm:gap-2">
                        {message.suggestions.map((suggestion, index) => (
                          <Button
                            key={index}
                            variant="outline"
                            size="sm"
                            className="text-xs h-6 sm:h-7 px-2 hover:bg-accent hover:text-accent-foreground"
                            onClick={() => handleSuggestionClick(suggestion)}
                          >
                            {suggestion}
                          </Button>
                        ))}
                      </div>
                    )}
                  </div>

                  {message.role === "user" && (
                    <Avatar className="h-6 w-6 sm:h-8 sm:w-8 bg-info-subtle shrink-0">
                      <AvatarFallback>
                        <User className="h-3 w-3 sm:h-4 sm:w-4 text-info" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}

              {isLoading && (
                <div className="flex gap-2 sm:gap-3 justify-start">
                  <Avatar className="h-6 w-6 sm:h-8 sm:w-8 bg-purple-subtle">
                    <AvatarFallback>
                      <Bot className="h-3 w-3 sm:h-4 sm:w-4 text-purple" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="bg-muted rounded-lg px-3 py-2 sm:px-4">
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                      <div
                        className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                        style={{ animationDelay: "0.1s" }}
                      />
                      <div
                        className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Input Area - Tailwind v4 Optimized */}
          <div className="border-t border-border p-3 sm:p-4">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me about your data..."
                className="flex-1 text-sm bg-background border-input"
                disabled={isLoading}
              />
              <Button onClick={handleSend} disabled={isLoading || !input.trim()} size="icon" className="shrink-0">
                <Send className="h-4 w-4" />
              </Button>
            </div>

            {/* Quick Suggestions */}
            <div className="mt-2 sm:mt-3 flex flex-wrap gap-1 sm:gap-2">
              {SUGGESTED_QUESTIONS.slice(0, 3).map((question, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  size="sm"
                  className="text-xs h-6 sm:h-7 text-muted-foreground hover:text-foreground hover:bg-accent px-2"
                  onClick={() => handleSuggestionClick(question)}
                >
                  {question}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
