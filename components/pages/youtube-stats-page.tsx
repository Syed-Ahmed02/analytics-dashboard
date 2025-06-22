"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AISummaryModal } from "@/components/ai-summary-modal"
import { MonthToggle } from "@/components/month-toggle"
import { DataTable } from "@/components/data-table/data-table"
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header"
import { leadAttribution } from "@/lib/mock-data"
import { useMonthlyRevenue } from "@/hooks/use-monthly-revenue"
import { useYouTubeData } from "@/hooks/use-youtube-data"
import { Play, ThumbsUp, MessageCircle, DollarSign, ExternalLink, AlertCircle } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { useState } from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"


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


function calculateVideoPerformance(
  videos: any[],
  attributionData: typeof leadAttribution
): VideoPerformance[] {
  const videoPerformance = videos
    .map(video => {
      const attribution = attributionData.find(attr => attr.video_id === video.video_id)
      const totalRevenue = attribution?.total_revenue || 0
      const viewCount = video.viewCount
      const callsBooked = attribution?.calls_booked || 0

      const roiPerView = viewCount > 0 ? (totalRevenue / viewCount).toFixed(2) : "0.00"
      const roiPerLead = callsBooked > 0 ? (totalRevenue / callsBooked).toFixed(0) : "0"

      return {
        ...video,
        calls_booked: attribution?.calls_booked,
        total_closes: attribution?.total_closes,
        total_revenue: totalRevenue,
        roi_per_view: roiPerView,
        roi_per_lead: roiPerLead,
      }
    })
    .sort((a, b) => (b.total_revenue || 0) - (a.total_revenue || 0))

  return videoPerformance
}

function calculateTotals(videos: any[], attributionData: typeof leadAttribution) {
  const totalViews = videos.reduce((sum, video) => sum + video.viewCount, 0)
  const totalLikes = videos.reduce((sum, video) => sum + video.likes, 0)
  const totalComments = videos.reduce((sum, video) => sum + video.commentCount, 0)
  const totalRevenue = attributionData.reduce((sum, attr) => sum + attr.total_revenue, 0)

  return { totalViews, totalLikes, totalComments, totalRevenue }
}

function prepareChartData(videoPerformance: VideoPerformance[]) {
  return videoPerformance.slice(0, 10).map(video => ({
    title: video.title.length > 30 ? video.title.substring(0, 30) + "..." : video.title,
    views: video.viewCount,
    revenue: video.total_revenue || 0,
    roi: Number(video.roi_per_view),
  }))
}

function prepareAISummaryData(monthlyRevenue: any[], youtubeVideos: any[]) {
  // Calculate totals for all data
  const totalViews = leadAttribution.reduce((sum, item) => sum + item.total_views, 0)
  const totalRevenue = monthlyRevenue.reduce((sum, item) => sum + item.total_cash_collected, 0)
  const totalCallsBooked = leadAttribution.reduce((sum, item) => sum + item.calls_booked, 0)
  const totalCloses = leadAttribution.reduce((sum, item) => sum + item.total_closes, 0)

  // Find top performing video
  const topVideo = leadAttribution.reduce((max, current) =>
    current.total_revenue > max.total_revenue ? current : max,
  )

  // Calculate conversion rates
  const viewToCallRate = ((totalCallsBooked / totalViews) * 100).toFixed(2)
  const callToCloseRate = ((totalCloses / totalCallsBooked) * 100).toFixed(1)
  const overallConversionRate = ((totalCloses / totalViews) * 100).toFixed(4)

  // Calculate ROI metrics
  const avgROIPerView = (totalRevenue / totalViews).toFixed(2)
  const avgROIPerCall = totalCallsBooked > 0 ? (totalRevenue / totalCallsBooked).toFixed(0) : "0"

  // Monthly trends
  const monthlyTrends = monthlyRevenue.map(month => ({
    month: month.month,
    revenue: month.total_cash_collected,
    visitors: month.unique_website_visitors
  }))

  // Video performance breakdown
  const videoPerformance = calculateVideoPerformance(youtubeVideos, leadAttribution)
  const topVideos = videoPerformance.slice(0, 5).map(video => ({
    title: video.title,
    views: video.viewCount,
    revenue: video.total_revenue || 0,
    roi_per_view: video.roi_per_view,
    calls_booked: video.calls_booked || 0
  }))

  return {
    // Key metrics
    "Total Views": totalViews,
    "Total Revenue": totalRevenue,
    "Total Calls Booked": totalCallsBooked,
    "Total Closes": totalCloses,
    
    // Conversion rates
    "View to Call Rate": viewToCallRate,
    "Call to Close Rate": callToCloseRate,
    "Overall Conversion Rate": overallConversionRate,
    
    // ROI metrics
    "Average ROI per View": avgROIPerView,
    "Average ROI per Call": avgROIPerCall,
    
    // Top performer
    topVideo: {
      video_id: topVideo.video_id,
      revenue: topVideo.total_revenue,
      views: topVideo.total_views,
      calls_booked: topVideo.calls_booked,
      roi_per_view: topVideo.total_views > 0 ? (topVideo.total_revenue / topVideo.total_views).toFixed(2) : "0.00"
    },
    
    // Monthly trends
    monthlyTrends: monthlyTrends,
    
    // Top videos
    topVideos: topVideos,
    
    // Performance insights
    performanceInsights: {
      avg_monthly_revenue: (totalRevenue / monthlyRevenue.length).toFixed(0),
      avg_monthly_visitors: (monthlyRevenue.reduce((sum, month) => sum + month.unique_website_visitors, 0) / monthlyRevenue.length).toFixed(0),
      revenue_per_view: avgROIPerView,
      revenue_per_call: avgROIPerCall
    }
  }
}

export function YoutubeStatsPage() {
  const { data: monthlyRevenue, loading: revenueLoading, error: revenueError } = useMonthlyRevenue()
  const { data: youtubeVideos, loading: youtubeLoading, error: youtubeError, source } = useYouTubeData()
  const availableMonths = ["all", ...monthlyRevenue.map((item) => item.month)]
  const [selectedMonth, setSelectedMonth] = useState("all")

  const loading = revenueLoading || youtubeLoading
  const error = revenueError || youtubeError

  if (loading) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold">YouTube Performance</h1>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 sm:gap-4 lg:gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 w-24 bg-muted animate-pulse rounded" />
                <div className="h-4 w-4 bg-muted animate-pulse rounded" />
              </CardHeader>
              <CardContent>
                <div className="h-8 w-20 bg-muted animate-pulse rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold">YouTube Performance</h1>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-muted-foreground">
              <p>Error loading YouTube data: {error}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // All calculations are now in helper functions
  const videoPerformance = calculateVideoPerformance(youtubeVideos, leadAttribution)
  const { totalViews, totalLikes, totalComments, totalRevenue } = calculateTotals(youtubeVideos, leadAttribution)
  const chartData = prepareChartData(videoPerformance)

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
          <AISummaryModal page="youtube" data={prepareAISummaryData(monthlyRevenue, youtubeVideos)} />
        </div>
      </div>

      {/* Data Source Indicator */}
      {source && (
        <div className="flex items-center gap-2">
          <Badge variant={source === 'webhook' ? 'default' : 'secondary'} className="text-xs">
            {source === 'webhook' ? '🟢 Live Data' : '🟡 Mock Data'}
          </Badge>
          {source === 'mock' && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <AlertCircle className="h-3 w-3" />
              Using fallback data - webhook unavailable
            </div>
          )}
        </div>
      )}

      {/* Top Metrics - Responsive Grid */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 sm:gap-4 lg:gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Play className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{totalViews.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Likes</CardTitle>
            <ThumbsUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{totalLikes.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Comments</CardTitle>
            <MessageCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{totalComments.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">${totalRevenue.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Top Videos by Views</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis
                    dataKey="title"
                    tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }} />
                  <Tooltip
                    formatter={(value) => [Number(value).toLocaleString(), "Views"]}
                    contentStyle={{
                      backgroundColor: "var(--color-card)",
                      border: "1px solid var(--color-border)",
                      borderRadius: "6px",
                      color: "var(--color-card-foreground)",
                    }}
                  />
                  <Bar dataKey="views" fill="var(--color-primary)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Revenue vs Views</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis
                    dataKey="title"
                    tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }} />
                  <Tooltip
                    formatter={(value) => [`$${Number(value).toLocaleString()}`, "Revenue"]}
                    contentStyle={{
                      backgroundColor: "var(--color-card)",
                      border: "1px solid var(--color-border)",
                      borderRadius: "6px",
                      color: "var(--color-card-foreground)",
                    }}
                  />
                  <Bar dataKey="revenue" fill="var(--color-primary)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Video Performance Table */}
      <Card>
        <CardHeader>
          <CardTitle>Video Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={[
              {
                accessorKey: "title",
                header: ({ column }) => <DataTableColumnHeader column={column} title="Video Title" />,
                cell: ({ row }) => (
                  <div className="max-w-[300px] truncate" title={row.getValue("title")}>
                    {row.getValue("title")}
                  </div>
                ),
              },
              {
                accessorKey: "viewCount",
                header: ({ column }) => <DataTableColumnHeader column={column} title="Views" />,
                cell: ({ row }) => <div className="font-mono">{row.getValue<number>("viewCount").toLocaleString()}</div>,
              },
              {
                accessorKey: "likes",
                header: ({ column }) => <DataTableColumnHeader column={column} title="Likes" />,
                cell: ({ row }) => <div className="font-mono">{row.getValue<number>("likes").toLocaleString()}</div>,
              },
              {
                accessorKey: "commentCount",
                header: ({ column }) => <DataTableColumnHeader column={column} title="Comments" />,
                cell: ({ row }) => <div className="font-mono">{row.getValue<number>("commentCount").toLocaleString()}</div>,
              },
              {
                accessorKey: "calls_booked",
                header: ({ column }) => <DataTableColumnHeader column={column} title="Calls Booked" />,
                cell: ({ row }) => (
                  <div className="font-mono">{row.getValue<number>("calls_booked")?.toLocaleString() || "0"}</div>
                ),
              },
              {
                accessorKey: "total_revenue",
                header: ({ column }) => <DataTableColumnHeader column={column} title="Revenue" />,
                cell: ({ row }) => (
                  <div className="font-mono">${row.getValue<number>("total_revenue")?.toLocaleString() || "0"}</div>
                ),
              },
              {
                accessorKey: "roi_per_view",
                header: ({ column }) => <DataTableColumnHeader column={column} title="ROI/View" />,
                cell: ({ row }) => (
                  <div className="font-mono">${row.getValue<string>("roi_per_view")}</div>
                ),
              },
              {
                accessorKey: "roi_per_lead",
                header: ({ column }) => <DataTableColumnHeader column={column} title="ROI/Lead" />,
                cell: ({ row }) => (
                  <div className="font-mono">${row.getValue<string>("roi_per_lead")}</div>
                ),
              },
              {
                id: "actions",
                header: "Actions",
                cell: ({ row }) => (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.open(`https://youtube.com/watch?v=${row.original.video_id}`, "_blank")}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                ),
              },
            ]}
            data={videoPerformance}
            searchKey="title"
            searchPlaceholder="Search videos..."
          />
        </CardContent>
      </Card>
    </div>
  )
}

