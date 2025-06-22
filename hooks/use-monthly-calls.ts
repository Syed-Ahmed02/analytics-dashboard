import { useState, useEffect, useMemo, useCallback } from 'react'
import { fetchWithCache } from '@/lib/api-cache'

interface MonthlyCall {
  month: string
  calls: number
  growth: number
}

interface CallsResponse {
  success: boolean
  data: MonthlyCall[]
  source: 'api' | 'mock'
  error?: string
}

export function useMonthlyCalls() {
  const [data, setData] = useState<MonthlyCall[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [source, setSource] = useState<'api' | 'mock'>('mock')

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response: CallsResponse = await fetchWithCache('/api/cal/monthly-calls')
      
      if (response.success) {
        setData(response.data)
        setSource(response.source)
      } else {
        setError(response.error || 'Failed to fetch calls data')
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
  const totalCalls = useMemo(() => 
    memoizedData.reduce((sum, item) => sum + item.calls, 0), 
    [memoizedData]
  )

  const averageCalls = useMemo(() => 
    memoizedData.length > 0 ? Math.round(totalCalls / memoizedData.length) : 0, 
    [totalCalls, memoizedData.length]
  )

  const averageGrowth = useMemo(() => 
    memoizedData.length > 0 ? Math.round(memoizedData.reduce((sum, item) => sum + item.growth, 0) / memoizedData.length) : 0, 
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
    totalCalls,
    averageCalls,
    averageGrowth,
    refetch: fetchData
  }
} 