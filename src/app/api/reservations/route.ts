import { NextResponse } from 'next/server';
import { getDB, createReservationAtomic, cancelReservation } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const db = getDB();

    let list = db.reservations;
    if (userId) {
      list = list.filter(r => r.user_id === userId);
    }

    // Enrich with station name, charger details, and vehicle model
    const enriched = list.map(r => {
      const charger = db.chargers.find(c => c.charger_id === r.charger_id);
      const station = db.stations.find(s => s.station_id === charger?.station_id);
      const vehicle = db.vehicles.find(v => v.vehicle_id === r.vehicle_id);

      return {
        ...r,
        station_name: station ? station.name : 'Central Station',
        charger_identifier: charger ? `${charger.charger_identifier} (${charger.connector_type})` : 'Gun Port',
        vehicle_model: vehicle ? `${vehicle.make} ${vehicle.model} (${vehicle.registration_no})` : 'EV'
      };
    });

    return NextResponse.json({ success: true, reservations: enriched });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, vehicleId, chargerId, startTime, endTime } = body;

    if (!userId || !vehicleId || !chargerId || !startTime || !endTime) {
      return NextResponse.json({ error: 'Missing required reservation fields.' }, { status: 400 });
    }

    const reservation = createReservationAtomic({
      userId,
      vehicleId,
      chargerId,
      startTime,
      endTime
    });

    return NextResponse.json({ success: true, reservation });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { reservationId } = body;
    if (!reservationId) {
      return NextResponse.json({ error: 'Reservation ID required' }, { status: 400 });
    }

    const cancelled = cancelReservation(reservationId);
    return NextResponse.json({ success: true, reservation: cancelled });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
