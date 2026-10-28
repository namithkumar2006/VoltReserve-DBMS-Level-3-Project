import { NextResponse } from 'next/server';
import { getAnalytics, getNoSqlTelemetryAggregation } from '@/lib/db';

export async function GET() {
  try {
    const analytics = getAnalytics();
    const nosqlTelemetry = getNoSqlTelemetryAggregation();

    return NextResponse.json({
      success: true,
      analytics,
      nosqlTelemetry
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
