"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Info } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface FunnelStage {
  name: string
  value: number
  description: string
  color: string
}

interface FunnelChartProps {
  data: FunnelStage[]
  title?: string
}

export function FunnelChart({ data, title = "Sales Funnel" }: FunnelChartProps) {
  const [hoveredStage, setHoveredStage] = useState<number | null>(null)

  const calculateWidth = (value: number, index: number): number => {
    const maxWidth = 100
    const minWidth = 20
    return maxWidth - ((maxWidth - minWidth) * index) / (data.length - 1)
  }

  return (
    <Card className="min-w-0">
      <CardHeader>
        <CardTitle className="text-base sm:text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 sm:space-y-3">
          {data.map((stage, index) => (
            <div key={stage.name} className="relative">
              <div
                className={`
                  ${stage.color} rounded-lg shadow-sm transition-all duration-300
                  hover:shadow-md cursor-pointer relative overflow-hidden
                `}
                style={{
                  width: `${calculateWidth(stage.value, index)}%`,
                  marginLeft: `${(100 - calculateWidth(stage.value, index)) / 2}%`,
                }}
                onMouseEnter={() => setHoveredStage(index)}
                onMouseLeave={() => setHoveredStage(null)}
              >
                <div className="p-2 sm:p-4 text-white">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-xs sm:text-sm lg:text-base truncate">{stage.name}</h3>
                      <p className="text-sm sm:text-lg lg:text-xl font-bold">{stage.value.toLocaleString()}</p>
                    </div>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-3 w-3 sm:h-4 sm:w-4 opacity-70 hover:opacity-100 shrink-0 ml-2" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs text-xs">{stage.description}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>

                {/* Animated background effect on hover */}
                {hoveredStage === index && <div className="absolute inset-0 bg-white bg-opacity-10 animate-pulse" />}
              </div>

              {/* Connection line to next stage */}
              {index < data.length - 1 && (
                <div className="flex justify-center mt-1 sm:mt-2 mb-1">
                  <div className="w-px h-3 sm:h-4 bg-gray-300" />
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
