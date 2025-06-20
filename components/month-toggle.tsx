"use client"

import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface MonthToggleProps {
  selectedMonth: string
  onMonthChange: (month: string) => void
  availableMonths: string[]
}

export function MonthToggle({ selectedMonth, onMonthChange, availableMonths }: MonthToggleProps) {
  const currentIndex = availableMonths.indexOf(selectedMonth)

  const goToPrevious = () => {
    if (currentIndex > 0) {
      onMonthChange(availableMonths[currentIndex - 1])
    }
  }

  const goToNext = () => {
    if (currentIndex < availableMonths.length - 1) {
      onMonthChange(availableMonths[currentIndex + 1])
    }
  }

  const formatMonth = (month: string) => {
    if (month === "all") return "All Months"
    const date = new Date(month + "-01")
    return date.toLocaleDateString("en-US", { month: "long", year: "numeric" })
  }

  return (
    <div className="flex items-center gap-1 sm:gap-2 bg-muted rounded-lg p-1">
      <Button
        variant="ghost"
        size="sm"
        onClick={goToPrevious}
        disabled={currentIndex <= 0}
        className="h-7 w-7 sm:h-8 sm:w-8 p-0"
      >
        <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" />
      </Button>

      <div className="px-2 sm:px-3 py-1 text-xs sm:text-sm font-medium min-w-[100px] sm:min-w-[120px] text-center">
        <span className="hidden sm:inline">{formatMonth(selectedMonth)}</span>
        <span className="sm:hidden">
          {selectedMonth === "all"
            ? "All"
            : new Date(selectedMonth + "-01").toLocaleDateString("en-US", { month: "short", year: "2-digit" })}
        </span>
      </div>

      <Button
        variant="ghost"
        size="sm"
        onClick={goToNext}
        disabled={currentIndex >= availableMonths.length - 1}
        className="h-7 w-7 sm:h-8 sm:w-8 p-0"
      >
        <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
      </Button>
    </div>
  )
}
