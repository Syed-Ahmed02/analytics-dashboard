"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AISummaryModal } from "@/components/ai-summary-modal"
import { MonthToggle } from "@/components/month-toggle"
import { DataTable } from "@/components/data-table/data-table"
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header"
import { youtubeVideos, leadAttribution, monthlyRevenue } from "@/lib/mock-data"
import { Play, ThumbsUp, MessageCircle, DollarSign, ExternalLink } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { useState } from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"

// Define the video performance type
type VideoPerformance = {
  video_id: string
  title: string
  viewCount: number
  likes: number
  commentCount: number
  publishedAt: string
  calls_booked?: number
  total_closes?: number
  total_revenue?: number
  roi_per_view: string
  roi_per_lead: string
}

// Define columns for the YouTube videos table
const columns: ColumnDef<VideoPerformance>[] = [
  {
    accessorKey: "title",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Video Title" />,
    cell: ({ row }) => {
      const isTopPerformer = row.index === 0
      return (
        <div className="flex items-center gap-2 max-w-[300px]">
          {isTopPerformer && (
            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 shrink-0">
              🏆
            </Badge>
          )}
          <span className="font-medium text-sm truncate" title={row.getValue("title")}>
            {row.getValue("title")}
          </span>
        </div>
      )
    },
  },
  {
    accessorKey: "viewCount",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Views" />,
    cell: ({ row }) => <div className="font-mono text-sm">{row.getValue<number>("viewCount").toLocaleString()}</div>,
  },
  {
    accessorKey: "likes",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Likes" />,
    cell: ({ row }) => (
      <div className="font-mono text-sm flex items-center gap-1">
        <ThumbsUp className="h-3 w-3 text-muted-foreground" />
        {row.getValue<number>("likes").toLocaleString()}
      </div>
    ),
  },
  {
    accessorKey: "commentCount",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Comments" />,
    cell: ({ row }) => (
      <div className="font-mono text-sm flex items-center gap-1">
        <MessageCircle className="h-3 w-3 text-muted-foreground" />
        {row.getValue<number>("commentCount").toLocaleString()}
      </div>
    ),
  },
  {
    accessorKey: "calls_booked",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Calls" />,
    cell: ({ row }) => <div className="font-mono text-sm">{row.getValue("calls_booked") || 0}</div>,
  },
  {
    accessorKey: "total_closes",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Closes" />,
    cell: ({ row }) => <div className="font-mono text-sm">{row.getValue("total_closes") || 0}</div>,
  },
  {
    accessorKey: "total_revenue",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Revenue" />,
    cell: ({ row }) => (
      <div className="font-mono text-sm">${(row.getValue("total_revenue") || 0).toLocaleString()}</div>
    ),
  },
  {
    accessorKey: "roi_per_view",
    header: ({ column }) => <DataTableColumnHeader column={column} title="ROI/View" />,
    cell: ({ row }) => <div className="font-mono text-sm">${row.getValue("roi_per_view")}</div>,
  },
  {
    accessorKey: "roi_per_lead",
    header: ({ column }) => <DataTableColumnHeader column={column} title="ROI/Lead" />,
    cell: ({ row }) => <div className="font-mono text-sm">${row.getValue("roi_per_lead")}</div>,
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const video = row.original
      return (
        <Button variant="ghost" size="sm" asChild>
          <a
            href={`https://youtube.com/watch?v=${video.video_id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="h-8 w-8 p-0"
          >
            <ExternalLink className="h-4 w-4" />
            <span className="sr-only">Open video</span>
          </a>
        </Button>
      )
    },
  },
]

export function YoutubeStatsPage() {
  const availableMonths = ["all", ...monthlyRevenue.map((item) => item.month)]
  const [selectedMonth, setSelectedMonth] = useState("all")

  // Combine video data with attribution data
  const videoPerformance: VideoPerformance[] = youtubeVideos
    .map((video) => {
      const attribution = leadAttribution.find((attr) => attr.video_id === video.video_id)
      return {
        ...video,
        calls_booked: attribution?.calls_booked,
        total_closes: attribution?.total_closes,
        total_revenue: attribution?.total_revenue,
        roi_per_view: attribution ? (attribution.total_revenue / video.viewCount).toFixed(2) : "0.00",
        roi_per_lead: attribution ? (attribution.total_revenue / attribution.calls_booked).toFixed(0) : "0",
      }
    })
    .sort((a, b) => (b.total_revenue || 0) - (a.total_revenue || 0))

  const chartData = videoPerformance.slice(0, 8).map((video) => ({
    title: video.title.substring(0, 25) + "...",
    revenue: video.total_revenue || 0,
    views: video.viewCount,
    calls: video.calls_booked || 0,
  }))

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold">YouTube Performance</h1>
        <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
          <MonthToggle
            selectedMonth={selectedMonth}
            onMonthChange={setSelectedMonth}
            availableMonths={availableMonths}
          />
          <AISummaryModal page="youtube" />
        </div>
      </div>

      {/* Top Metrics - Responsive Grid */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 sm:gap-4 lg:gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Total Views</CardTitle>
            <Play className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-xl lg:text-2xl font-bold">
              {youtubeVideos.reduce((sum, video) => sum + video.viewCount, 0).toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Total Likes</CardTitle>
            <ThumbsUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-xl lg:text-2xl font-bold">
              {youtubeVideos.reduce((sum, video) => sum + video.likes, 0).toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Total Comments</CardTitle>
            <MessageCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-xl lg:text-2xl font-bold">
              {youtubeVideos.reduce((sum, video) => sum + video.commentCount, 0).toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-xl lg:text-2xl font-bold">
              ${leadAttribution.reduce((sum, attr) => sum + attr.total_revenue, 0).toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Chart - Responsive */}
      <Card className="min-w-0">
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">Revenue Attribution by Video</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] sm:h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="title" angle={-45} textAnchor="end" height={100} tick={{ fontSize: 8 }} interval={0} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip formatter={(value) => [`$${Number(value).toLocaleString()}`, "Revenue"]} />
                <Bar dataKey="revenue" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Video Performance Table - Responsive */}
      <Card className="min-w-0">
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">Video Performance Leaderboard</CardTitle>
        </CardHeader>
        <CardContent className="p-0 sm:p-6">
          <div className="overflow-x-auto">
            <DataTable
              columns={columns}
              data={videoPerformance}
              searchKey="title"
              searchPlaceholder="Search videos..."
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
