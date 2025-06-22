import { useState, useEffect, useMemo, useCallback } from 'react'
import { fetchWithCache } from '@/lib/api-cache'

interface VideoSource {
  video_id: string
  calls_booked: number
  accepted: number
  show_ups: number
  closes: number
  revenue: number
}

interface MonthlyCall {
  month: string
  total_booked: number
  accepted: number
  show_ups: number
  cancelled: number
  no_shows: number
  video_sources: VideoSource[]
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
    memoizedData.reduce((sum, item) => sum + item.total_booked, 0), 
    [memoizedData]
  )

  const totalAccepted = useMemo(() => 
    memoizedData.reduce((sum, item) => sum + item.accepted, 0), 
    [memoizedData]
  )

  const totalShowUps = useMemo(() => 
    memoizedData.reduce((sum, item) => sum + item.show_ups, 0), 
    [memoizedData]
  )

  const totalCancelled = useMemo(() => 
    memoizedData.reduce((sum, item) => sum + item.cancelled, 0), 
    [memoizedData]
  )

  const totalNoShows = useMemo(() => 
    memoizedData.reduce((sum, item) => sum + item.no_shows, 0), 
    [memoizedData]
  )

  const averageCalls = useMemo(() => 
    memoizedData.length > 0 ? Math.round(totalCalls / memoizedData.length) : 0, 
    [totalCalls, memoizedData.length]
  )

  const showUpRate = useMemo(() => 
    totalAccepted > 0 ? Math.round((totalShowUps / totalAccepted) * 100) : 0, 
    [totalShowUps, totalAccepted]
  )

  const cancellationRate = useMemo(() => 
    totalCalls > 0 ? Math.round((totalCancelled / totalCalls) * 100) : 0, 
    [totalCancelled, totalCalls]
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
    totalAccepted,
    totalShowUps,
    totalCancelled,
    totalNoShows,
    averageCalls,
    showUpRate,
    cancellationRate,
    refetch: fetchData
  }
} 