// ============================================================
// KidneyHub - API Route: /api/donors
// GET all donors | POST create donor
// ============================================================

import { NextResponse } from 'next/server';
import { donorDb } from '@/lib/firebase/database';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const donors = await donorDb.getAll();
    return NextResponse.json({ success: true, data: donors });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Gagal mengambil data donor' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const id = await donorDb.create(body);
    return NextResponse.json({ success: true, id }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Gagal membuat donor' }, { status: 500 });
  }
}
