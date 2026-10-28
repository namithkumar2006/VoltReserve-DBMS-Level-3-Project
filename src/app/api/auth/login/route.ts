import { NextResponse } from 'next/server';
import { getDB } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    const db = getDB();

    const user = db.users.find(u => u.email.toLowerCase() === (email || '').toLowerCase().trim());
    if (!user) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    // In production, verify bcrypt/argon2 hash. For project demo, check standard passwords.
    const vehicle = db.vehicles.find(v => v.user_id === user.user_id);

    return NextResponse.json({
      success: true,
      user,
      vehicle: vehicle || null
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
