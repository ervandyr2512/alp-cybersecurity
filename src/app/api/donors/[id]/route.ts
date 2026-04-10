import { NextResponse } from 'next/server';
import { donorDb } from '@/lib/firebase/database';

export const dynamic = 'force-dynamic';

type Context = { params: Promise<{ id: string }> };

export async function GET(_: Request, { params }: Context) {
  const { id } = await params;
  const donor = await donorDb.get(id);
  if (!donor) return NextResponse.json({ success: false, error: 'Tidak ditemukan' }, { status: 404 });
  return NextResponse.json({ success: true, data: donor });
}

export async function PATCH(request: Request, { params }: Context) {
  const { id } = await params;
  const body = await request.json();
  await donorDb.update(id, body);
  return NextResponse.json({ success: true });
}

export async function DELETE(_: Request, { params }: Context) {
  const { id } = await params;
  await donorDb.delete(id);
  return NextResponse.json({ success: true });
}
