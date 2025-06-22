import { useState, useEffect } from 'react'

interface VideoSource {
  video_id: string
  calls_booked: number
  accepted: number
  show_ups: number
  closes: number
  revenue: number
}

interface MonthlyCallsData {
  month: string
  total_booked: number
  accepted: number
  show_ups: number
  cancelled: number
  no_shows: number
  video_sources: VideoSource[]
}

interface ApiResponse {
  success: boolean
  data: MonthlyCallsData[]
  error?: string
}

export function useMonthlyCalls() {
  const [data, setData] = useState<MonthlyCallsData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const response = await fetch('/api/kajabi/monthly-calls')
        const result: ApiResponse = await response.json()
        
        if (result.success) {
          setData(result.data)
        } else {
          setError(result.error || 'Failed to fetch monthly calls data')
        }
      } catch (err) {
        setError('Failed to fetch monthly calls data')
        console.error('Error fetching monthly calls:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  return { data, loading, error }
} 