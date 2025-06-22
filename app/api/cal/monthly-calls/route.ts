import { NextResponse } from 'next/server'
import { monthlyCalls } from '@/lib/mock-data'

export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      data: monthlyCalls
    })
  } catch (error) {
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch monthly calls data' 
      },
      { status: 500 }
    )
  }
} 