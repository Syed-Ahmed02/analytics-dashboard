import { useState, useEffect } from 'react'

interface YouTubeVideo {
  video_id: string
  title: string
  viewCount: number
  thumbnailUrl: string
  likes: number
  commentCount: number
  publishedAt: string
}

interface ApiResponse {
  success: boolean
  data: YouTubeVideo[]
  source: 'webhook' | 'mock'
  error?: string
  requestBody?: any
}

export function useYouTubeData() {
  const [data, setData] = useState<YouTubeVideo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [source, setSource] = useState<'webhook' | 'mock' | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const response = await fetch('/api/youtube/data')
        const result: ApiResponse = await response.json()
        
        if (result.success) {
          setData(result.data)
          setSource(result.source)
          if (result.error) {
            console.warn('YouTube data source warning:', result.error)
          }
        } else {
          setError('Failed to fetch YouTube data')
        }
      } catch (err) {
        setError('Failed to fetch YouTube data')
        console.error('Error fetching YouTube data:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  return { data, loading, error, source }
} 