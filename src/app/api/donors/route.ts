// ============================================================
// /api/donors — list + create
// RBAC: list restricted to admin/doctor/hospital_staff.
// ============================================================

import { NextResponse } from 'next/server';
import { donorDbS as donorDb } from '@/lib/firebase/server-db';
import { authenticate, authorize } from '@/lib/auth/api-guard';
import { canListAllDonors, canCreateDonor, canViewDonor } from '@/lib/auth/policies';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const auth = await authenticate(request);
  if (auth.kind === 'failure') return auth.response;

  // Donor role → hanya boleh lihat data miliknya sendiri (filter by userId)
  if (auth.ctx.role === 'donor') {
    const all = await donorDb.getAll();
    const own = all.filter((d) => d.userId === auth.ctx.uid);
    return NextResponse.json({ success: true, data: own, matched: 'ABAC' });
  }

  const decision = canListAllDonors(auth.ctx);
  const denied = authorize(decision);
  if (denied) return denied;

  const data = await donorDb.getAll();
  // hospital_staff → filter ABAC: hanya donor yang ditugaskan ke rumah sakitnya
  if (auth.ctx.role === 'hospital_staff') {
    const filtered = data.filter((d) => d.assignedHospitalId === auth.ctx.linkedId);
    return NextResponse.json({ success: true, data: filtered, matched: 'RBAC+ABAC' });
  }
  return NextResponse.json({ success: true, data, matched: decision.matched });
}

export async function POST(request: Request) {
  const auth = await authenticate(request);
  if (auth.kind === 'failure') return auth.response;

  const denied = authorize(canCreateDonor(auth.ctx));
  if (denied) return denied;

  const body = await request.json();

  // Donor self-creating: force userId to self (ignore client-provided)
  if (auth.ctx.role === 'donor') {
    body.userId = auth.ctx.uid;
  }
  const id = await donorDb.create(body);

  // Re-read to run ABAC check (defence in depth)
  const created = await donorDb.get(id);
  if (created) {
    const viewCheck = canViewDonor(auth.ctx, created);
    if (!viewCheck.allow) {
      return NextResponse.json(
        { success: false, error: 'Data dibuat tapi Anda tidak bisa mengaksesnya', id },
        { status: 201 },
      );
    }
  }
  return NextResponse.json({ success: true, id }, { status: 201 });
}
