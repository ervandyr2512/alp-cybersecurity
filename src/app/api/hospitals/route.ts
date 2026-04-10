import { NextResponse } from 'next/server';
import { hospitalDb } from '@/lib/firebase/database';

export const dynamic = 'force-dynamic';

export async function GET() {
  const data = await hospitalDb.getAll();
  return NextResponse.json({ success: true, data });
}

export async function POST(request: Request) {
  const body = await request.json();
  const id = await hospitalDb.create(body);
  return NextResponse.json({ success: true, id }, { status: 201 });
}
