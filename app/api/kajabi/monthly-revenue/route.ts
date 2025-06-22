import { NextResponse } from 'next/server'
import { monthlyRevenue } from '@/lib/mock-data'

export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      data: monthlyRevenue
    })
  } catch (error) {
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch monthly revenue data' 
      },
      { status: 500 }
    )
  }
}
