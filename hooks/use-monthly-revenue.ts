import { useState, useEffect, useMemo, useCallback } from 'react'
import { fetchWithCache } from '@/lib/api-cache'

interface MonthlyRevenue {
  month: string
  new_cash_collected: {
    pif: number
    installments: number
  }
  total_cash_collected: number
  high_ticket_closes: {
    pif: number
    installments: number
  }
  discount_closes: {
    pif: number
    installments: number
  }
  unique_website_visitors: number
  email_opens: number
  email_clicks: number
}

interface RevenueResponse {
  success: boolean
  data: MonthlyRevenue[]
  source: 'api' | 'mock'
  error?: string
}

export function useMonthlyRevenue() {
  const [data, setData] = useState<MonthlyRevenue[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [source, setSource] = useState<'api' | 'mock'>('mock')

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response: RevenueResponse = await fetchWithCache('/api/kajabi/monthly-revenue')
      
      if (response.success) {
        setData(response.data)
        setSource(response.source)
      } else {
        setError(response.error || 'Failed to fetch revenue data')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }, [])

  // Memoize the data to prevent unnecessary re-renders
  const memoizedData = useMemo(() => data, [data])

  // Memoize computed values
  const totalRevenue = useMemo(() => 
    memoizedData.reduce((sum, item) => sum + item.total_cash_collected, 0), 
    [memoizedData]
  )

  const averageRevenue = useMemo(() => 
    memoizedData.length > 0 ? Math.round(totalRevenue / memoizedData.length) : 0, 
    [totalRevenue, memoizedData.length]
  )

  const totalPIF = useMemo(() => 
    memoizedData.reduce((sum, item) => sum + item.new_cash_collected.pif, 0), 
    [memoizedData]
  )

  const totalInstallments = useMemo(() => 
    memoizedData.reduce((sum, item) => sum + item.new_cash_collected.installments, 0), 
    [memoizedData]
  )

  const totalVisitors = useMemo(() => 
    memoizedData.reduce((sum, item) => sum + item.unique_website_visitors, 0), 
    [memoizedData]
  )

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return {
    data: memoizedData,
    loading,
    error,
    source,
    totalRevenue,
    averageRevenue,
    totalPIF,
    totalInstallments,
    totalVisitors,
    refetch: fetchData
  }
} 