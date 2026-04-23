// ============================================================
// /api/doctors — list + create
// RBAC: only admin manages doctors.
// ============================================================

import { NextResponse } from 'next/server';
import { doctorDbS as doctorDb } from '@/lib/firebase/server-db';
import { authenticate, authorize } from '@/lib/auth/api-guard';
import { canListDoctors, canManageDoctors } from '@/lib/auth/policies';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const auth = await authenticate(request);
  if (auth.kind === 'failure') return auth.response;
  const decision = canListDoctors(auth.ctx);
  const denied = authorize(decision);
  if (denied) return denied;

  const data = await doctorDb.getAll();
  return NextResponse.json({ success: true, data, matched: decision.matched });
}

export async function POST(request: Request) {
  const auth = await authenticate(request);
  if (auth.kind === 'failure') return auth.response;
  const denied = authorize(canManageDoctors(auth.ctx));
  if (denied) return denied;

  const body = await request.json();
  const id = await doctorDb.create(body);
  return NextResponse.json({ success: true, id }, { status: 201 });
}
