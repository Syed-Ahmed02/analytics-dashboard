"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AISummaryModal } from "@/components/ai-summary-modal"
import { FunnelChart } from "@/components/funnel-chart"
import { MonthToggle } from "@/components/month-toggle"
import { monthlyRevenue, monthlyCalls, leadAttribution } from "@/lib/mock-data"
import { TrendingUp, TrendingDown, Eye, Phone, DollarSign, Users } from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { useState } from "react"

function prepareAISummaryData() {
  // Calculate totals for all data
  const totalViews = leadAttribution.reduce((sum, item) => sum + item.total_views, 0)
  const totalWebsiteVisitors = monthlyRevenue.reduce((sum, item) => sum + item.unique_website_visitors, 0)
  const totalCallsBooked = monthlyCalls.reduce((sum, item) => sum + item.total_booked, 0)
  const totalRevenue = monthlyRevenue.reduce((sum, item) => sum + item.total_cash_collected, 0)
  const totalSalesClosed = monthlyRevenue.reduce(
    (sum, item) =>
      sum +
      item.high_ticket_closes.pif +
      item.high_ticket_closes.installments +
      item.discount_closes.pif +
      item.discount_closes.installments,
    0,
  )

  // Calculate conversion rates
  const viewToWebsiteRate = ((totalWebsiteVisitors / totalViews) * 100).toFixed(2)
  const websiteToCallRate = ((totalCallsBooked / totalWebsiteVisitors) * 100).toFixed(2)
  const callToSaleRate = ((totalSalesClosed / totalCallsBooked) * 100).toFixed(2)
  const overallConversionRate = ((totalSalesClosed / totalViews) * 100).toFixed(4)

  // Calculate month-over-month changes
  const latestMonth = monthlyRevenue[monthlyRevenue.length - 1]
  const previousMonth = monthlyRevenue[monthlyRevenue.length - 2]
  
  const calculateChange = (current: number, previous: number) => {
    if (previous === 0) return 0
    return (((current - previous) / previous) * 100).toFixed(1)
  }

  const revenueChange = calculateChange(latestMonth.total_cash_collected, previousMonth.total_cash_collected)
  const visitorsChange = calculateChange(latestMonth.unique_website_visitors, previousMonth.unique_website_visitors)
  const callsChange = calculateChange(
    monthlyCalls[monthlyCalls.length - 1]?.total_booked || 0,
    monthlyCalls[monthlyCalls.length - 2]?.total_booked || 0,
  )

  // Find best performing month
  const bestMonth = monthlyRevenue.reduce((max, month) => 
    month.total_cash_collected > max.total_cash_collected ? month : max
  )

  // Find top performing video by revenue
  const topVideo = leadAttribution.reduce((max, current) =>
    current.total_revenue > max.total_revenue ? current : max,
  )

  // Calculate ROI per view for top video
  const topVideoROI = topVideo.total_views > 0 ? (topVideo.total_revenue / topVideo.total_views).toFixed(2) : "0.00"

  // Monthly trends
  const monthlyTrends = monthlyRevenue.map(month => ({
    month: month.month,
    revenue: month.total_cash_collected,
    visitors: month.unique_website_visitors,
    calls: monthlyCalls.find(call => call.month === month.month)?.total_booked || 0,
    sales: (month.high_ticket_closes.pif + month.high_ticket_closes.installments + 
            month.discount_closes.pif + month.discount_closes.installments)
  }))

  // Funnel data
  const funnelData = [
    {
      stage: "YouTube Views",
      value: totalViews,
      conversion_rate: 100,
      drop_off: 0
    },
    {
      stage: "Website Visitors", 
      value: totalWebsiteVisitors,
      conversion_rate: Number(viewToWebsiteRate),
      drop_off: 100 - Number(viewToWebsiteRate)
    },
    {
      stage: "Calls Booked",
      value: totalCallsBooked,
      conversion_rate: Number(websiteToCallRate),
      drop_off: Number(viewToWebsiteRate) - Number(websiteToCallRate)
    },
    {
      stage: "Sales Closed",
      value: totalSalesClosed,
      conversion_rate: Number(callToSaleRate),
      drop_off: Number(websiteToCallRate) - Number(callToSaleRate)
    }
  ]

  return {
    // Key metrics
    "Total YouTube Views": totalViews,
    "Total Website Visitors": totalWebsiteVisitors,
    "Total Calls Booked": totalCallsBooked,
    "Total Revenue": totalRevenue,
    "Total Sales Closed": totalSalesClosed,
    
    // Conversion rates
    "View to Website Rate": viewToWebsiteRate,
    "Website to Call Rate": websiteToCallRate,
    "Call to Sale Rate": callToSaleRate,
    "Overall Conversion Rate": overallConversionRate,
    
    // Month-over-month changes
    "Revenue Change": revenueChange,
    "Visitors Change": visitorsChange,
    "Calls Change": callsChange,
    
    // Performance highlights
    bestMonth: {
      month: bestMonth.month,
      revenue: bestMonth.total_cash_collected,
      visitors: bestMonth.unique_website_visitors
    },
    
    topVideo: {
      video_id: topVideo.video_id,
      revenue: topVideo.total_revenue,
      views: topVideo.total_views,
      calls_booked: topVideo.calls_booked,
      roi_per_view: topVideoROI
    },
    
    // Monthly trends
    monthlyTrends: monthlyTrends,
    
    // Funnel analysis
    funnelData: funnelData,
    
    // Performance insights
    performanceInsights: {
      avg_monthly_revenue: (totalRevenue / monthlyRevenue.length).toFixed(0),
      avg_monthly_visitors: (totalWebsiteVisitors / monthlyRevenue.length).toFixed(0),
      avg_monthly_calls: (totalCallsBooked / monthlyCalls.length).toFixed(0),
      revenue_per_visitor: (totalRevenue / totalWebsiteVisitors).toFixed(2),
      revenue_per_call: (totalRevenue / totalCallsBooked).toFixed(0)
    }
  }
}

export function HomePage() {
  const availableMonths = ["all", ...monthlyRevenue.map((item) => item.month)]
  const [selectedMonth, setSelectedMonth] = useState("all")

  const filteredData =
    selectedMonth === "all" ? monthlyRevenue : monthlyRevenue.filter((item) => item.month === selectedMonth)

  const calculateChange = (current: number, previous: number) => {
    if (previous === 0) return 0
    return (((current - previous) / previous) * 100).toFixed(1)
  }

  const latestMonth = monthlyRevenue[monthlyRevenue.length - 1]
  const previousMonth = monthlyRevenue[monthlyRevenue.length - 2]

  // Calculate totals for current period
  const totalViews = leadAttribution.reduce((sum, item) => sum + item.total_views, 0)
  const totalWebsiteVisitors = filteredData.reduce((sum, item) => sum + item.unique_website_visitors, 0)
  const totalCallsBooked = monthlyCalls.reduce((sum, item) => sum + item.total_booked, 0)
  const totalRevenue = filteredData.reduce((sum, item) => sum + item.total_cash_collected, 0)

  const metrics = [
    {
      title: "YouTube Total Views",
      value: totalViews.toLocaleString(),
      change: calculateChange(latestMonth.unique_website_visitors, previousMonth.unique_website_visitors),
      icon: Eye,
    },
    {
      title: "Website Visitors",
      value: totalWebsiteVisitors.toLocaleString(),
      change: calculateChange(latestMonth.unique_website_visitors, previousMonth.unique_website_visitors),
      icon: Users,
    },
    {
      title: "Calls Booked",
      value: totalCallsBooked.toString(),
      change: calculateChange(
        monthlyCalls[monthlyCalls.length - 1]?.total_booked || 0,
        monthlyCalls[monthlyCalls.length - 2]?.total_booked || 0,
      ),
      icon: Phone,
    },
    {
      title: "Total Cash Collected",
      value: `$${totalRevenue.toLocaleString()}`,
      change: calculateChange(latestMonth.total_cash_collected, previousMonth.total_cash_collected),
      icon: DollarSign,
    },
  ]

  // Funnel data for the chart with Tailwind v4 colors
  const funnelData = [
    {
      name: "YouTube Views",
      value: totalViews,
      description: "Total views across all YouTube videos",
      color: "bg-blue-600",
    },
    {
      name: "Website Visitors",
      value: totalWebsiteVisitors,
      description: "Unique visitors who clicked from YouTube to website",
      color: "bg-blue-500",
    },
    {
      name: "Calls Booked",
      value: totalCallsBooked,
      description: "Visitors who booked a discovery call",
      color: "bg-blue-400",
    },
    {
      name: "Sales Closed",
      value: filteredData.reduce(
        (sum, item) =>
          sum +
          item.high_ticket_closes.pif +
          item.high_ticket_closes.installments +
          item.discount_closes.pif +
          item.discount_closes.installments,
        0,
      ),
      description: "Calls that converted to paying customers",
      color: "bg-blue-300",
    },
  ]

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold">Funnel Overview</h1>
        <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
          <MonthToggle
            selectedMonth={selectedMonth}
            onMonthChange={setSelectedMonth}
            availableMonths={availableMonths}
          />
          <AISummaryModal page="home" data={prepareAISummaryData()} />
        </div>
      </div>

      {/* Key Metrics - Responsive Grid */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 sm:gap-4 lg:gap-6">
        {metrics.map((metric, index) => {
          const isPositive = Number(metric.change) > 0
          const Icon = metric.icon
          return (
            <Card key={index} className="min-w-0 transition-colors hover:bg-accent/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium truncate pr-2">{metric.title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
              </CardHeader>
              <CardContent className="space-y-1">
                <div className="text-lg sm:text-xl lg:text-2xl font-bold truncate">{metric.value}</div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  {isPositive ? (
                    <TrendingUp className="h-3 w-3 text-success shrink-0" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-destructive shrink-0" />
                  )}
                  <span className={`${isPositive ? "text-success" : "text-destructive"} truncate`}>
                    {metric.change}% from last month
                  </span>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Charts - Responsive Layout */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-6">
        <Card className="min-w-0">
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">Revenue Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px] sm:h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={filteredData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                    interval={0}
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
                  <Line type="monotone" dataKey="total_cash_collected" stroke="var(--color-primary)" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <div className="min-w-0">
          <FunnelChart data={funnelData} title="Sales Funnel Drop-Off" />
        </div>
      </div>

      {/* Performance Highlights - Responsive Cards */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">Performance Highlights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="text-center p-3 sm:p-4 bg-success-subtle rounded-lg">
              <Badge variant="secondary" className="mb-2 badge-success">
                Record High
              </Badge>
              <p className="text-xs sm:text-sm text-muted-foreground">Best Month</p>
              <p className="text-lg sm:text-xl lg:text-2xl font-bold">June 2025</p>
              <p className="text-xs sm:text-sm">$145K Total Revenue</p>
            </div>
            <div className="text-center p-3 sm:p-4 bg-info-subtle rounded-lg">
              <Badge variant="secondary" className="mb-2 badge-info">
                Top Video
              </Badge>
              <p className="text-xs sm:text-sm text-muted-foreground">Highest ROI</p>
              <p className="text-sm sm:text-lg font-bold truncate">Office Tour</p>
              <p className="text-xs sm:text-sm">$1.88 per view</p>
            </div>
            <div className="text-center p-3 sm:p-4 bg-purple-subtle rounded-lg sm:col-span-2 lg:col-span-1">
              <Badge variant="secondary" className="mb-2 badge-purple">
                Conversion
              </Badge>
              <p className="text-xs sm:text-sm text-muted-foreground">View to Call Rate</p>
              <p className="text-lg sm:text-xl lg:text-2xl font-bold">0.82%</p>
              <p className="text-xs sm:text-sm">Exceptional performance</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
