"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { AISummaryModal } from "@/components/ai-summary-modal"
import { MonthToggle } from "@/components/month-toggle"
import { monthlyRevenue, leadAttribution, calculateConversionRates } from "@/lib/mock-data"
import { Globe, Users, Phone, Target } from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { useState } from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { DataTable } from "@/components/data-table/data-table"
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header"

export function WebpageStatsPage() {
  const availableMonths = ["all", ...monthlyRevenue.map((item) => item.month)]
  const [selectedMonth, setSelectedMonth] = useState("all")

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

  const funnelData = [
    {
      stage: "Website Visitors",
      value: filteredData.reduce((sum, month) => sum + month.unique_website_visitors, 0),
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

  // Define columns for the country table
  const countryColumns: ColumnDef<{ country: string; count: number; percentage: string }>[] = [
    {
      accessorKey: "country",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Country" />,
      cell: ({ row }) => <div className="font-medium">{row.getValue("country")}</div>,
    },
    {
      accessorKey: "count",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Total Leads" />,
      cell: ({ row }) => <div className="font-mono">{row.getValue("count")}</div>,
    },
    {
      accessorKey: "percentage",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Percentage" />,
      cell: ({ row }) => <div className="font-mono">{row.getValue("percentage")}%</div>,
    },
    {
      id: "distribution",
      header: "Distribution",
      cell: ({ row }) => {
        const percentage = Number.parseFloat(row.getValue("percentage"))
        return <Progress value={percentage} className="h-2 w-24" />
      },
    },
  ]

  const countryTableData = countryArray.map(({ country, count }) => {
    const percentage = ((count / countryArray.reduce((sum, item) => sum + item.count, 0)) * 100).toFixed(1)
    return { country, count, percentage }
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold">Website Analytics</h1>
        <div className="flex flex-col sm:flex-row gap-4">
          <MonthToggle
            selectedMonth={selectedMonth}
            onMonthChange={setSelectedMonth}
            availableMonths={availableMonths}
          />
          <AISummaryModal page="webpage" />
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Visitors</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">
              {filteredData.reduce((sum, month) => sum + month.unique_website_visitors, 0).toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Monthly Visitors</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">
              {Math.round(
                filteredData.reduce((sum, month) => sum + month.unique_website_visitors, 0) / filteredData.length,
              ).toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Click to Call Rate</CardTitle>
            <Phone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{conversionRates.click_to_call}%</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overall Conversion</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{conversionRates.show_to_close}%</div>
          </CardContent>
        </Card>
      </div>

      {/* Visitor Trends */}
      <Card>
        <CardHeader>
          <CardTitle>Website Visitor Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={filteredData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} angle={-45} textAnchor="end" height={60} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip formatter={(value) => [Number(value).toLocaleString(), "Visitors"]} />
              <Line type="monotone" dataKey="unique_website_visitors" stroke="#8884d8" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Conversion Funnel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Conversion Funnel</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {funnelData.map((stage, index) => (
                <div key={stage.stage} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">{stage.stage}</span>
                    <span className="text-sm text-muted-foreground">
                      {stage.value.toLocaleString()} ({stage.percentage.toFixed(1)}%)
                    </span>
                  </div>
                  <Progress value={stage.percentage} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Conversion Rates Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                <span className="font-medium">View to Click</span>
                <span className="text-lg font-bold text-blue-600">{conversionRates.view_to_click}%</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                <span className="font-medium">Click to Call</span>
                <span className="text-lg font-bold text-green-600">{conversionRates.click_to_call}%</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                <span className="font-medium">Call to Show</span>
                <span className="text-lg font-bold text-yellow-600">{conversionRates.call_to_show}%</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                <span className="font-medium">Show to Close</span>
                <span className="text-lg font-bold text-purple-600">{conversionRates.show_to_close}%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Country Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Lead Sources by Country</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={countryColumns}
            data={countryTableData}
            searchKey="country"
            searchPlaceholder="Search countries..."
          />
        </CardContent>
      </Card>
    </div>
  )
}
