// ============================================================
// /api/hospitals — list + create
// RBAC: list open to all authenticated users; only admin creates.
// ============================================================

import { NextResponse } from 'next/server';
import { hospitalDbS as hospitalDb } from '@/lib/firebase/server-db';
import { authenticate, authorize } from '@/lib/auth/api-guard';
import { canListHospitals, canManageHospitals } from '@/lib/auth/policies';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const auth = await authenticate(request);
  if (auth.kind === 'failure') return auth.response;
  const decision = canListHospitals();
  const denied = authorize(decision);
  if (denied) return denied;

  const data = await hospitalDb.getAll();
  return NextResponse.json({ success: true, data, matched: decision.matched });
}

export async function POST(request: Request) {
  const auth = await authenticate(request);
  if (auth.kind === 'failure') return auth.response;
  const denied = authorize(canManageHospitals(auth.ctx));
  if (denied) return denied;

  const body = await request.json();
  const id = await hospitalDb.create(body);
  return NextResponse.json({ success: true, id }, { status: 201 });
}
