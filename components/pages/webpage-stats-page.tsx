"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { AISummaryModal } from "@/components/ai-summary-modal"
import { MonthToggle } from "@/components/month-toggle"
import { leadAttribution, calculateConversionRates } from "@/lib/mock-data"
import { useMonthlyRevenue } from "@/hooks/use-monthly-revenue"
import { Globe, Users, Phone, Target } from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { useState } from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { DataTable } from "@/components/data-table/data-table"
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header"

function prepareAISummaryData(monthlyRevenue: any[]) {
  // Calculate overall conversion rates
  const totalData = leadAttribution.reduce(
    (acc, attr) => ({
      total_views: acc.total_views + attr.total_views,
      website_clicks: acc.website_clicks + attr.website_clicks,
      calls_booked: acc.calls_booked + attr.calls_booked,
      show_ups: acc.show_ups + attr.show_ups,
      total_closes: acc.total_closes + attr.total_closes,
      total_revenue: acc.total_revenue + attr.total_revenue,
    }),
    { total_views: 0, website_clicks: 0, calls_booked: 0, show_ups: 0, total_closes: 0, total_revenue: 0 },
  )

  const conversionRates = calculateConversionRates(totalData)

  // Aggregate country data
  const countryData = leadAttribution.reduce(
    (acc, attr) => {
      Object.entries(attr.countries).forEach(([country, count]) => {
        acc[country] = (acc[country] || 0) + count
      })
      return acc
    },
    {} as Record<string, number>,
  )

  const countryArray = Object.entries(countryData)
    .map(([country, count]) => ({ country, count }))
    .sort((a, b) => b.count - a.count)

  const totalVisitors = monthlyRevenue.reduce((sum, month) => sum + month.unique_website_visitors, 0)
  const avgMonthlyVisitors = Math.round(totalVisitors / monthlyRevenue.length)

  return {
    // Key metrics
    "Total Visitors": totalVisitors,
    "Average Monthly Visitors": avgMonthlyVisitors,
    "Total Revenue": totalData.total_revenue,
    "Total Calls Booked": totalData.calls_booked,
    "Total Show Ups": totalData.show_ups,
    "Total Closes": totalData.total_closes,
    
    // Conversion rates
    "View to Click Rate": conversionRates.view_to_click,
    "Click to Call Rate": conversionRates.click_to_call,
    "Call to Show Rate": conversionRates.call_to_show,
    "Show to Close Rate": conversionRates.show_to_close,
    
    // Monthly trends
    monthlyTrends: monthlyRevenue.map(month => ({
      month: month.month,
      visitors: month.unique_website_visitors,
      revenue: month.total_cash_collected
    })),
    
    // Country breakdown
    countryBreakdown: countryArray.map(({ country, count }) => {
      const percentage = ((count / countryArray.reduce((sum, item) => sum + item.count, 0)) * 100).toFixed(1)
      return { country, leads: count, percentage }
    }),
    
    // Conversion funnel data
    conversionFunnel: [
      {
        stage: "Website Visitors",
        value: totalVisitors,
        percentage: 100,
      },
      {
        stage: "Calls Booked",
        value: totalData.calls_booked,
        percentage: Number.parseFloat(conversionRates.click_to_call),
      },
      {
        stage: "Show Ups",
        value: totalData.show_ups,
        percentage: Number.parseFloat(conversionRates.call_to_show),
      },
      {
        stage: "Closes",
        value: totalData.total_closes,
        percentage: Number.parseFloat(conversionRates.show_to_close),
      },
    ],
    
    // Top performing countries
    topCountries: countryArray.slice(0, 5).map(({ country, count }) => ({
      country,
      leads: count,
      percentage: ((count / countryArray.reduce((sum, item) => sum + item.count, 0)) * 100).toFixed(1)
    }))
  }
}

export function WebpageStatsPage() {
  const { data: monthlyRevenue, loading, error } = useMonthlyRevenue()
  const availableMonths = ["all", ...monthlyRevenue.map((item) => item.month)]
  const [selectedMonth, setSelectedMonth] = useState("all")

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-2xl sm:text-3xl font-bold">Website Performance</h1>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
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
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-2xl sm:text-3xl font-bold">Website Performance</h1>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-muted-foreground">
              <p>Error loading website data: {error}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const filteredData =
    selectedMonth === "all" ? monthlyRevenue : monthlyRevenue.filter((item) => item.month === selectedMonth)

  // Calculate overall conversion rates
  const totalData = leadAttribution.reduce(
    (acc, attr) => ({
      total_views: acc.total_views + attr.total_views,
      website_clicks: acc.website_clicks + attr.website_clicks,
      calls_booked: acc.calls_booked + attr.calls_booked,
      show_ups: acc.show_ups + attr.show_ups,
      total_closes: acc.total_closes + attr.total_closes,
      total_revenue: acc.total_revenue + attr.total_revenue,
    }),
    { total_views: 0, website_clicks: 0, calls_booked: 0, show_ups: 0, total_closes: 0, total_revenue: 0 },
  )

  const conversionRates = calculateConversionRates(totalData)

  // Aggregate country data
  const countryData = leadAttribution.reduce(
    (acc, attr) => {
      Object.entries(attr.countries).forEach(([country, count]) => {
        acc[country] = (acc[country] || 0) + count
      })
      return acc
    },
    {} as Record<string, number>,
  )

  const countryArray = Object.entries(countryData)
    .map(([country, count]) => ({ country, count }))
    .sort((a, b) => b.count - a.count)

  const totalVisitors = filteredData.reduce((sum, month) => sum + month.unique_website_visitors, 0)
  const totalEmailOpens = filteredData.reduce((sum, month) => sum + month.email_opens, 0)
  const totalEmailClicks = filteredData.reduce((sum, month) => sum + month.email_clicks, 0)

  const metrics = [
    {
      title: "Website Visitors",
      value: totalVisitors.toLocaleString(),
      icon: Users,
    },
    {
      title: "Email Opens",
      value: totalEmailOpens.toLocaleString(),
      icon: Globe,
    },
    {
      title: "Email Clicks",
      value: totalEmailClicks.toLocaleString(),
      icon: Target,
    },
    {
      title: "Calls Booked",
      value: totalData.calls_booked.toLocaleString(),
      icon: Phone,
    },
  ]

  const conversionData = [
    {
      stage: "Website Visitors",
      value: totalVisitors,
      percentage: 100,
    },
    {
      stage: "Calls Booked",
      value: totalData.calls_booked,
      percentage: Number.parseFloat(conversionRates.click_to_call),
    },
    {
      stage: "Show Ups",
      value: totalData.show_ups,
      percentage: Number.parseFloat(conversionRates.call_to_show),
    },
    {
      stage: "Closes",
      value: totalData.total_closes,
      percentage: Number.parseFloat(conversionRates.show_to_close),
    },
  ]

  const chartData = filteredData.map((month) => ({
    month: new Date(month.month + "-01").toLocaleDateString("en-US", { month: "short" }),
    visitors: month.unique_website_visitors,
    revenue: month.total_cash_collected,
  }))

  // Define columns for country data
  const countryColumns: ColumnDef<any>[] = [
    {
      accessorKey: "country",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Country" />,
      cell: ({ row }) => <div className="font-medium">{row.getValue("country")}</div>,
    },
    {
      accessorKey: "count",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Leads" />,
      cell: ({ row }) => <div className="font-mono">{row.getValue<number>("count").toLocaleString()}</div>,
    },
    {
      accessorKey: "percentage",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Percentage" />,
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Progress value={row.getValue<number>("percentage")} className="w-20" />
          <span className="text-sm text-muted-foreground">{row.getValue<number>("percentage").toFixed(1)}%</span>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold">Website Performance</h1>
        <div className="flex flex-col sm:flex-row gap-4">
          <MonthToggle
            selectedMonth={selectedMonth}
            onMonthChange={setSelectedMonth}
            availableMonths={availableMonths}
          />
          <AISummaryModal page="webpage" data={prepareAISummaryData(monthlyRevenue)} />
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {metrics.map((metric, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
              <metric.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold">{metric.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Visitor Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }}
                  />
                  <YAxis tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--color-card)",
                      border: "1px solid var(--color-border)",
                      borderRadius: "6px",
                      color: "var(--color-card-foreground)",
                    }}
                  />
                  <Line type="monotone" dataKey="visitors" stroke="var(--color-primary)" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Conversion Funnel</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {conversionData.map((stage, index) => (
                <div key={stage.stage} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{stage.stage}</span>
                    <span className="text-muted-foreground">
                      {stage.value.toLocaleString()} ({stage.percentage.toFixed(1)}%)
                    </span>
                  </div>
                  <Progress value={stage.percentage} className="w-full" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Country Data Table */}
      <Card>
        <CardHeader>
          <CardTitle>Traffic by Country</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={countryColumns}
            data={countryArray.map(({ country, count }) => ({
              country,
              count,
              percentage: (count / countryArray.reduce((sum, item) => sum + item.count, 0)) * 100,
            }))}
            searchKey="country"
            searchPlaceholder="Search countries..."
          />
        </CardContent>
      </Card>
    </div>
  )
}
