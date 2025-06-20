"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AISummaryModal } from "@/components/ai-summary-modal"
import { MonthToggle } from "@/components/month-toggle"
import { monthlyRevenue, leadAttribution, youtubeVideos } from "@/lib/mock-data"
import { DollarSign, TrendingUp, CreditCard, Target } from "lucide-react"
import { Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { useState } from "react"

// Add these imports at the top
import type { ColumnDef } from "@tanstack/react-table"
import { DataTable } from "@/components/data-table/data-table"
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header"

function prepareAISummaryData() {
  // Calculate totals for all data
  const totalRevenue = monthlyRevenue.reduce((sum, month) => sum + month.total_cash_collected, 0)
  const totalPIF = monthlyRevenue.reduce((sum, month) => sum + month.new_cash_collected.pif, 0)
  const totalInstallments = monthlyRevenue.reduce((sum, month) => sum + month.new_cash_collected.installments, 0)
  const totalHighTicketCloses = monthlyRevenue.reduce(
    (sum, month) => sum + month.high_ticket_closes.pif + month.high_ticket_closes.installments,
    0,
  )
  const totalDiscountCloses = monthlyRevenue.reduce(
    (sum, month) => sum + month.discount_closes.pif + month.discount_closes.installments,
    0,
  )

  // Find top performer
  const topPerformer = leadAttribution.reduce((max, current) =>
    current.total_revenue > max.total_revenue ? current : max,
  )
  const topVideo = youtubeVideos.find((video) => video.video_id === topPerformer.video_id)

  // Calculate revenue percentages
  const pifPercentage = ((totalPIF / totalRevenue) * 100).toFixed(1)
  const installmentsPercentage = ((totalInstallments / totalRevenue) * 100).toFixed(1)

  // Calculate average revenue per close
  const totalCloses = totalHighTicketCloses + totalDiscountCloses
  const avgRevenuePerClose = totalCloses > 0 ? (totalRevenue / totalCloses).toFixed(0) : "0"

  // Monthly performance data
  const monthlyPerformance = monthlyRevenue.map((month) => ({
    month: month.month,
    total_cash: month.total_cash_collected,
    pif_revenue: month.new_cash_collected.pif,
    installments_revenue: month.new_cash_collected.installments,
    new_cash_total: month.new_cash_collected.pif + month.new_cash_collected.installments,
    high_ticket_closes: month.high_ticket_closes.pif + month.high_ticket_closes.installments,
    discount_closes: month.discount_closes.pif + month.discount_closes.installments,
    total_closes: (month.high_ticket_closes.pif + month.high_ticket_closes.installments) + 
                  (month.discount_closes.pif + month.discount_closes.installments)
  }))

  // Revenue breakdown for charts
  const revenueBreakdown = [
    { name: "PIF", value: totalPIF, percentage: pifPercentage },
    { name: "Installments", value: totalInstallments, percentage: installmentsPercentage },
  ]

  const closesBreakdown = [
    { name: "High Ticket", value: totalHighTicketCloses, percentage: ((totalHighTicketCloses / totalCloses) * 100).toFixed(1) },
    { name: "Discount", value: totalDiscountCloses, percentage: ((totalDiscountCloses / totalCloses) * 100).toFixed(1) },
  ]

  return {
    // Key metrics
    "Total Revenue": totalRevenue,
    "PIF Revenue": totalPIF,
    "Installments Revenue": totalInstallments,
    "High Ticket Closes": totalHighTicketCloses,
    "Discount Closes": totalDiscountCloses,
    "Total Closes": totalCloses,
    "Average Revenue per Close": avgRevenuePerClose,
    
    // Percentages
    "PIF Percentage": pifPercentage,
    "Installments Percentage": installmentsPercentage,
    
    // Top performer data
    topPerformer: {
      video_id: topPerformer.video_id,
      video_title: topVideo?.title || "Unknown Video",
      revenue: topPerformer.total_revenue,
      calls_booked: topPerformer.calls_booked,
      total_closes: topPerformer.total_closes,
      conversion_rate: ((topPerformer.total_closes / topPerformer.calls_booked) * 100).toFixed(1)
    },
    
    // Monthly trends
    monthlyTrends: monthlyPerformance.map(month => ({
      month: month.month,
      total_cash: month.total_cash,
      pif_revenue: month.pif_revenue,
      installments_revenue: month.installments_revenue,
      new_cash_total: month.new_cash_total,
      total_closes: month.total_closes,
      avg_revenue_per_close: month.total_closes > 0 ? (month.total_cash / month.total_closes).toFixed(0) : "0"
    })),
    
    // Revenue breakdown
    revenueBreakdown: revenueBreakdown,
    
    // Closes breakdown
    closesBreakdown: closesBreakdown,
    
    // Performance insights
    performanceInsights: {
      best_month: monthlyPerformance.reduce((max, month) => 
        month.total_cash > max.total_cash ? month : max
      ),
      worst_month: monthlyPerformance.reduce((min, month) => 
        month.total_cash < min.total_cash ? month : min
      ),
      avg_monthly_revenue: (totalRevenue / monthlyRevenue.length).toFixed(0),
      avg_monthly_closes: (totalCloses / monthlyRevenue.length).toFixed(1)
    }
  }
}

export function SalesStatsPage() {
  const availableMonths = ["all", ...monthlyRevenue.map((item) => item.month)]
  const [selectedMonth, setSelectedMonth] = useState("all")

  const filteredData =
    selectedMonth === "all" ? monthlyRevenue : monthlyRevenue.filter((item) => item.month === selectedMonth)

  const totalRevenue = filteredData.reduce((sum, month) => sum + month.total_cash_collected, 0)
  const totalPIF = filteredData.reduce((sum, month) => sum + month.new_cash_collected.pif, 0)
  const totalInstallments = filteredData.reduce((sum, month) => sum + month.new_cash_collected.installments, 0)
  const totalHighTicketCloses = filteredData.reduce(
    (sum, month) => sum + month.high_ticket_closes.pif + month.high_ticket_closes.installments,
    0,
  )
  const totalDiscountCloses = filteredData.reduce(
    (sum, month) => sum + month.discount_closes.pif + month.discount_closes.installments,
    0,
  )

  const revenueBreakdown = [
    { name: "PIF", value: totalPIF, color: "#8884d8" },
    { name: "Installments", value: totalInstallments, color: "#82ca9d" },
  ]

  const closesBreakdown = [
    { name: "High Ticket", value: totalHighTicketCloses, color: "#8884d8" },
    { name: "Discount", value: totalDiscountCloses, color: "#82ca9d" },
  ]

  // Find top performer
  const topPerformer = leadAttribution.reduce((max, current) =>
    current.total_revenue > max.total_revenue ? current : max,
  )
  const topVideo = youtubeVideos.find((video) => video.video_id === topPerformer.video_id)

  const monthlyData = filteredData.map((month) => ({
    ...month,
    new_cash_total: month.new_cash_collected.pif + month.new_cash_collected.installments,
  }))

  // Define columns for monthly data
  const monthlyDataColumns: ColumnDef<any>[] = [
    {
      accessorKey: "month",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Month" />,
      cell: ({ row }) => {
        const date = new Date(row.getValue("month") + "-01")
        return <div className="font-medium">{date.toLocaleDateString("en-US", { month: "long", year: "numeric" })}</div>
      },
    },
    {
      accessorKey: "total_cash_collected",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Total Cash" />,
      cell: ({ row }) => (
        <div className="font-mono">${row.getValue<number>("total_cash_collected").toLocaleString()}</div>
      ),
    },
    {
      accessorKey: "new_cash_collected.pif",
      header: ({ column }) => <DataTableColumnHeader column={column} title="PIF Revenue" />,
      cell: ({ row }) => <div className="font-mono">${row.original.new_cash_collected.pif.toLocaleString()}</div>,
    },
    {
      accessorKey: "new_cash_collected.installments",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Installments" />,
      cell: ({ row }) => (
        <div className="font-mono">${row.original.new_cash_collected.installments.toLocaleString()}</div>
      ),
    },
    {
      accessorKey: "new_cash_total",
      header: ({ column }) => <DataTableColumnHeader column={column} title="New Cash Total" />,
      cell: ({ row }) => (
        <div className="font-mono font-bold">${row.getValue<number>("new_cash_total").toLocaleString()}</div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold">Sales Performance</h1>
        <div className="flex flex-col sm:flex-row gap-4">
          <MonthToggle
            selectedMonth={selectedMonth}
            onMonthChange={setSelectedMonth}
            availableMonths={availableMonths}
          />
          <AISummaryModal page="sales" data={prepareAISummaryData()} />
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">${totalRevenue.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">PIF Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">${totalPIF.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">{((totalPIF / totalRevenue) * 100).toFixed(1)}%</p>
          </CardContent>
        </Card>

        {/* Additional Cards for Installments Revenue, High Ticket Closes, and Discount Closes */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Installments Revenue</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">${totalInstallments.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">{((totalInstallments / totalRevenue) * 100).toFixed(1)}%</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Ticket Closes</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{totalHighTicketCloses.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Discount Closes</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{totalDiscountCloses.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h2 className="text-lg font-bold mb-4">Revenue Breakdown</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={revenueBreakdown}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#8884d8"
              >
                {revenueBreakdown.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div>
          <h2 className="text-lg font-bold mb-4">Closes Breakdown</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={closesBreakdown}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#8884d8"
              >
                {closesBreakdown.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Monthly Data Table */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Performance Data</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={monthlyDataColumns}
            data={monthlyData}
            searchKey="month"
            searchPlaceholder="Search months..."
          />
        </CardContent>
      </Card>
    </div>
  )
}
