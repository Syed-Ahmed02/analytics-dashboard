import { NextRequest, NextResponse } from 'next/server'
import { youtubeVideos } from '@/lib/mock-data'

const YOUTUBE_WEBHOOK_URL = 'https://n8n.syedd.com/webhook/c4f14ae3-f7f7-471b-a591-fa13100f5dfd'

interface YouTubeWebhookResponse {
  kind: string
  etag: string
  id: string
  snippet: {
    publishedAt: string
    channelId: string
    title: string
    description: string
    thumbnails: {
      default: { url: string; width: number; height: number }
      medium: { url: string; width: number; height: number }
      high: { url: string; width: number; height: number }
      standard: { url: string; width: number; height: number }
      maxres: { url: string; width: number; height: number }
    }
    channelTitle: string
    tags: string[]
    categoryId: string
    liveBroadcastContent: string
    localized: {
      title: string
      description: string
    }
    defaultAudioLanguage: string
  }
  contentDetails: {
    duration: string
    dimension: string
    definition: string
    caption: string
    licensedContent: boolean
    contentRating: Record<string, any>
    projection: string
  }
  status: {
    uploadStatus: string
    privacyStatus: string
    license: string
    embeddable: boolean
    publicStatsViewable: boolean
    madeForKids: boolean
  }
  statistics: {
    viewCount: string
    likeCount: string
    favoriteCount: string
    commentCount: string
  }
  player: {
    embedHtml: string
  }
  recordingDetails?: {
    locationDescription: string
    location?: {
      latitude: number
      longitude: number
      altitude: number
    }
  }
}

function transformYouTubeData(webhookData: YouTubeWebhookResponse) {
  // Add null checks to prevent errors
  if (!webhookData || !webhookData.snippet || !webhookData.statistics) {
    console.log('Invalid webhook data structure:', webhookData)
    throw new Error('Invalid webhook data structure')
  }

  return {
    video_id: webhookData.id || 'unknown',
    title: webhookData.snippet.title || 'Untitled',
    viewCount: parseInt(webhookData.statistics.viewCount || '0'),
    thumbnailUrl: webhookData.snippet.thumbnails?.high?.url || webhookData.snippet.thumbnails?.medium?.url || webhookData.snippet.thumbnails?.default?.url || '',
    likes: parseInt(webhookData.statistics.likeCount || '0'),
    commentCount: parseInt(webhookData.statistics.commentCount || '0'),
    publishedAt: webhookData.snippet.publishedAt || new Date().toISOString(),
    description: webhookData.snippet.description || '',
    channelTitle: webhookData.snippet.channelTitle || 'Unknown Channel',
    duration: webhookData.contentDetails?.duration || 'PT0S',
    tags: webhookData.snippet.tags || [],
    embedHtml: webhookData.player?.embedHtml || ''
  }
}

async function fetchYouTubeData() {
  try {
    const response = await fetch(YOUTUBE_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    
    // Check if the response indicates an error
    if (data.code === 0 && data.message?.includes('Error')) {
      throw new Error(data.message || 'Webhook returned an error')
    }

    // Check if the data is an array (which it should be based on the log)
    if (Array.isArray(data)) {
      console.log(`Processing ${data.length} videos from webhook`)
      // Transform each video in the array
      const transformedData = data.map(video => {
        try {
          return transformYouTubeData(video)
        } catch (error) {
          console.error('Error transforming video:', video.id, error)
          return null
        }
      }).filter(Boolean) // Remove any null entries from failed transformations
      
      return transformedData
    }

    // Check if the data has the expected structure for a single video
    if (data.snippet) {
      console.log('Processing single video from webhook')
      const transformedData = transformYouTubeData(data)
      return [transformedData]
    }

    console.log('Response does not have expected YouTube API structure, using raw data')
    // If it doesn't have the expected structure, return the raw data
    return [data]
  } catch (error) {
    console.error('Error fetching YouTube data from webhook:', error)
    throw error
  }
}

export async function GET() {
  try {
    const youtubeData = await fetchYouTubeData()
    
    return NextResponse.json({
      success: true,
      data: youtubeData,
      source: 'webhook'
    })
  } catch (error) {
    console.error('Failed to fetch YouTube data from webhook, falling back to mock data:', error)
    
    // Fallback to mock data
    return NextResponse.json({
      success: true,
      data: youtubeVideos,
      source: 'mock',
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const youtubeData = await fetchYouTubeData()
    
    return NextResponse.json({
      success: true,
      data: youtubeData,
      source: 'webhook',
      requestBody: body
    })
  } catch (error) {
    console.error('Failed to fetch YouTube data from webhook, falling back to mock data:', error)
    
    // Fallback to mock data
    return NextResponse.json({
      success: true,
      data: youtubeVideos,
      source: 'mock',
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
} 