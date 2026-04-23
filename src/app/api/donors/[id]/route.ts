// ============================================================
// /api/donors/[id] — get / update / delete
// ABAC: donor can only touch their own record (by userId).
// ============================================================

import { NextResponse } from 'next/server';
import { donorDbS as donorDb } from '@/lib/firebase/server-db';
import { authenticate, authorize } from '@/lib/auth/api-guard';
import {
  canViewDonor,
  canUpdateDonor,
  canDeleteDonor,
} from '@/lib/auth/policies';

export const dynamic = 'force-dynamic';

type Context = { params: Promise<{ id: string }> };

export async function GET(request: Request, { params }: Context) {
  const auth = await authenticate(request);
  if (auth.kind === 'failure') return auth.response;
  const { id } = await params;
  const donor = await donorDb.get(id);
  if (!donor) return NextResponse.json({ success: false, error: 'Tidak ditemukan' }, { status: 404 });

  const decision = canViewDonor(auth.ctx, donor);
  const denied = authorize(decision);
  if (denied) return denied;
  return NextResponse.json({ success: true, data: donor, matched: decision.matched });
}

export async function PATCH(request: Request, { params }: Context) {
  const auth = await authenticate(request);
  if (auth.kind === 'failure') return auth.response;
  const { id } = await params;
  const donor = await donorDb.get(id);
  if (!donor) return NextResponse.json({ success: false, error: 'Tidak ditemukan' }, { status: 404 });

  const decision = canUpdateDonor(auth.ctx, donor);
  const denied = authorize(decision);
  if (denied) return denied;

  const body = await request.json();
  await donorDb.update(id, body);
  return NextResponse.json({ success: true, matched: decision.matched });
}

export async function DELETE(request: Request, { params }: Context) {
  const auth = await authenticate(request);
  if (auth.kind === 'failure') return auth.response;
  const denied = authorize(canDeleteDonor(auth.ctx));
  if (denied) return denied;
  const { id } = await params;
  await donorDb.delete(id);
  return NextResponse.json({ success: true });
}
