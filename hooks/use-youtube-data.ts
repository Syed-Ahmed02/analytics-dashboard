import { useState, useEffect, useMemo, useCallback } from 'react'
import { fetchWithCache } from '@/lib/api-cache'

interface YouTubeVideo {
  video_id: string
  title: string
  viewCount: number
  thumbnailUrl: string
  likes: number
  commentCount: number
  publishedAt: string
  description: string
  channelTitle: string
  duration: string
  tags: string[]
  embedHtml: string
}

interface YouTubeDataResponse {
  success: boolean
  data: YouTubeVideo[]
  source: 'webhook' | 'mock'
  error?: string
}

export function useYouTubeData() {
  const [data, setData] = useState<YouTubeVideo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [source, setSource] = useState<'webhook' | 'mock'>('mock')

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response: YouTubeDataResponse = await fetchWithCache('/api/youtube/data')
      
      if (response.success) {
        setData(response.data)
        setSource(response.source)
      } else {
        setError(response.error || 'Failed to fetch YouTube data')
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
  const totalViews = useMemo(() => 
    memoizedData.reduce((sum, video) => sum + video.viewCount, 0), 
    [memoizedData]
  )

  const totalLikes = useMemo(() => 
    memoizedData.reduce((sum, video) => sum + video.likes, 0), 
    [memoizedData]
  )

  const totalComments = useMemo(() => 
    memoizedData.reduce((sum, video) => sum + video.commentCount, 0), 
    [memoizedData]
  )

  const averageViews = useMemo(() => 
    memoizedData.length > 0 ? Math.round(totalViews / memoizedData.length) : 0, 
    [totalViews, memoizedData.length]
  )

  const averageLikes = useMemo(() => 
    memoizedData.length > 0 ? Math.round(totalLikes / memoizedData.length) : 0, 
    [totalLikes, memoizedData.length]
  )

  const averageComments = useMemo(() => 
    memoizedData.length > 0 ? Math.round(totalComments / memoizedData.length) : 0, 
    [totalComments, memoizedData.length]
  )

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return {
    data: memoizedData,
    loading,
    error,
    source,
    totalViews,
    totalLikes,
    totalComments,
    averageViews,
    averageLikes,
    averageComments,
    refetch: fetchData
  }
} 