import { NextResponse } from 'next/server';
import { updateChargerStatus, getChargers } from '@/lib/db';

export async function GET() {
  try {
    const chargers = getChargers();
    return NextResponse.json({ success: true, chargers });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { chargerId, status } = body;

    if (!chargerId || !status) {
      return NextResponse.json({ error: 'chargerId and status required' }, { status: 400 });
    }

    const updated = updateChargerStatus(chargerId, status);
    return NextResponse.json({ success: true, charger: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
