import { NextResponse } from 'next/server';
import { medicalRecordDb } from '@/lib/firebase/database';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const donorId = searchParams.get('donorId');
  if (donorId) {
    const data = await medicalRecordDb.getByDonor(donorId);
    return NextResponse.json({ success: true, data });
  }
  const data = await medicalRecordDb.getAll();
  return NextResponse.json({ success: true, data });
}

export async function POST(request: Request) {
  const body = await request.json();
  const id = await medicalRecordDb.create(body);
  return NextResponse.json({ success: true, id }, { status: 201 });
}
