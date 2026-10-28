import { NextResponse } from 'next/server';
import { getStations } from '@/lib/db';

export async function GET() {
  try {
    const stations = getStations();
    return NextResponse.json({ success: true, stations });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
