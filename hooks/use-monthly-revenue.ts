import { useState, useEffect } from 'react'

interface MonthlyRevenueData {
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

interface ApiResponse {
  success: boolean
  data: MonthlyRevenueData[]
  error?: string
}

export function useMonthlyRevenue() {
  const [data, setData] = useState<MonthlyRevenueData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const response = await fetch('/api/kajabi/monthly-revenue')
        const result: ApiResponse = await response.json()
        
        if (result.success) {
          setData(result.data)
        } else {
          setError(result.error || 'Failed to fetch monthly revenue data')
        }
      } catch (err) {
        setError('Failed to fetch monthly revenue data')
        console.error('Error fetching monthly revenue:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  return { data, loading, error }
} 