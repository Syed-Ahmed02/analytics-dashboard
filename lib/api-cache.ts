// Cache for storing API responses
const apiCache = new Map<string, { data: any; timestamp: number; ttl: number }>()

// Cache TTL in milliseconds (5 minutes)
const CACHE_TTL = 5 * 60 * 1000

export async function fetchWithCache(url: string, options?: RequestInit): Promise<any> {
  const cacheKey = `${url}-${JSON.stringify(options || {})}`
  const now = Date.now()
  
  // Check if we have a valid cached response
  const cached = apiCache.get(cacheKey)
  if (cached && (now - cached.timestamp) < cached.ttl) {
    console.log('Using cached response for:', url)
    return cached.data
  }
  
  // Fetch fresh data
  console.log('Fetching fresh data for:', url)
  const response = await fetch(url, options)
  const data = await response.json()
  
  // Cache the response
  apiCache.set(cacheKey, {
    data,
    timestamp: now,
    ttl: CACHE_TTL
  })
  
  return data
}

// Function to clear cache (useful for testing or manual refresh)
export function clearCache(): void {
  apiCache.clear()
  console.log('API cache cleared')
}

// Function to get cache stats
export function getCacheStats(): { size: number; entries: string[] } {
  return {
    size: apiCache.size,
    entries: Array.from(apiCache.keys())
  }
} 