import { NextResponse } from 'next/server';
import { getDB, startChargingSession, completeChargingSession } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const db = getDB();

    let list = db.sessions;
    if (userId) {
      list = list.filter(s => s.user_id === userId);
    }

    const enriched = list.map(s => {
      const charger = db.chargers.find(c => c.charger_id === s.charger_id);
      const station = db.stations.find(st => st.station_id === charger?.station_id);

      return {
        ...s,
        station_name: station ? station.name : 'Central Station',
        charger_identifier: charger ? `${charger.charger_identifier} - ${charger.connector_type}` : 'Gun Port'
      };
    });

    return NextResponse.json({ success: true, sessions: enriched });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { reservationId, chargerId, userId, vehicleId, initialSoc } = body;

    const session = startChargingSession({
      reservationId,
      chargerId,
      userId,
      vehicleId,
      initialSoc: initialSoc || 20
    });

    return NextResponse.json({ success: true, session });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { sessionId, finalSoc, energyDeliveredKwh } = body;

    const session = completeChargingSession({
      sessionId,
      finalSoc: Number(finalSoc) || 85,
      energyDeliveredKwh: Number(energyDeliveredKwh) || 28.5
    });

    return NextResponse.json({ success: true, session });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
