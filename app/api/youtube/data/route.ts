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
  return {
    video_id: webhookData.id,
    title: webhookData.snippet.title,
    viewCount: parseInt(webhookData.statistics.viewCount),
    thumbnailUrl: webhookData.snippet.thumbnails.high.url,
    likes: parseInt(webhookData.statistics.likeCount),
    commentCount: parseInt(webhookData.statistics.commentCount),
    publishedAt: webhookData.snippet.publishedAt,
    description: webhookData.snippet.description,
    channelTitle: webhookData.snippet.channelTitle,
    duration: webhookData.contentDetails.duration,
    tags: webhookData.snippet.tags || [],
    embedHtml: webhookData.player.embedHtml
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

    // Transform the webhook data to match our expected format
    const transformedData = transformYouTubeData(data)
    
    // Return as an array to match the expected format
    return [transformedData]
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