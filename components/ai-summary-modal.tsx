"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Card, CardContent } from "@/components/ui/card"
import { Sparkles, Loader2 } from "lucide-react"
import { aiSummaries } from "@/lib/mock-data"

interface AISummaryModalProps {
  page: keyof typeof aiSummaries
  data?: Record<string, any>
}

export function AISummaryModal({ page, data }: AISummaryModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [summary, setSummary] = useState("")
  const [isOpen, setIsOpen] = useState(false)

  const generateSummary = async () => {
    setIsLoading(true)
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 2000))
    const response = await fetch("https://n8n.syedd.com/webhook-test/700a27a2-9d04-4673-8fcd-61d1de5f7d2d",{
      method: "POST",
      body: JSON.stringify({
        data,
        page,
      }),
    })
    const {summary} = await response.json()
    setSummary(summary)
    setIsLoading(false)
  }

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open)
    if (open && !summary) {
      generateSummary()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Sparkles className="h-4 w-4" />
          AI Summary
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-500" />
            AI-Generated Insights
          </DialogTitle>
        </DialogHeader>
        <Card>
          <CardContent className="pt-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                <span>Analyzing your data...</span>
              </div>
            ) : (
              <div className="prose prose-sm max-w-none">
                <p className="whitespace-pre-line">{summary}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  )
}
