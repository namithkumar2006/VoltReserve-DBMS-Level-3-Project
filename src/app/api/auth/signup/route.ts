import { NextResponse } from 'next/server';
import { getDB } from '@/lib/db';
import { User, Vehicle } from '@/types';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { fullName, email, password, phone, role, make, model, registrationNo, batteryCapacity, connectorType } = body;

    const db = getDB();

    if (!fullName || !email || !password) {
      return NextResponse.json({ error: 'Please provide full name, email, and password.' }, { status: 400 });
    }

    const existingUser = db.users.find(u => u.email.toLowerCase() === email.toLowerCase().trim());
    if (existingUser) {
      return NextResponse.json({ error: 'A user with this email already exists.' }, { status: 409 });
    }

    const userId = `usr_${Date.now()}`;
    const newUser: User = {
      user_id: userId,
      full_name: fullName,
      email: email.trim(),
      role: role === 'ADMIN' ? 'ADMIN' : 'CUSTOMER',
      phone_number: phone || '+91 98450 00000',
      wallet_balance: 1000.00, // Welcome signup bonus
      created_at: new Date().toISOString().replace('T', ' ').substring(0, 19)
    };

    db.users.push(newUser);

    let newVehicle: Vehicle | null = null;
    if (newUser.role === 'CUSTOMER') {
      newVehicle = {
        vehicle_id: `veh_${Date.now()}`,
        user_id: userId,
        make: make || 'Tata',
        model: model || 'Nexon EV',
        registration_no: (registrationNo || 'KA-01-EV-0001').toUpperCase(),
        battery_capacity_kwh: Number(batteryCapacity) || 40.5,
        connector_type: connectorType || 'CCS2'
      };
      db.vehicles.push(newVehicle);
    }

    return NextResponse.json({
      success: true,
      user: newUser,
      vehicle: newVehicle
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
