// ============================================================
// /api/medical-records — list + create
// Combined RBAC+ABAC: hospital_staff limited to their hospital,
// donor limited to their own records.
// ============================================================

import { NextResponse } from 'next/server';
import { medicalRecordDbS as medicalRecordDb } from '@/lib/firebase/server-db';
import { authenticate, authorize } from '@/lib/auth/api-guard';
import {
  canListMedicalRecords,
  canViewMedicalRecord,
  canCreateMedicalRecord,
} from '@/lib/auth/policies';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const auth = await authenticate(request);
  if (auth.kind === 'failure') return auth.response;

  const { searchParams } = new URL(request.url);
  const donorId = searchParams.get('donorId');

  // Donor role: can only see their own records (linkedId === donorId)
  if (auth.ctx.role === 'donor') {
    const ownId = auth.ctx.linkedId;
    if (!ownId) return NextResponse.json({ success: true, data: [], matched: 'ABAC' });
    const data = await medicalRecordDb.getByDonor(ownId);
    return NextResponse.json({ success: true, data, matched: 'ABAC' });
  }

  const decision = canListMedicalRecords(auth.ctx);
  const denied = authorize(decision);
  if (denied) return denied;

  let data = donorId
    ? await medicalRecordDb.getByDonor(donorId)
    : await medicalRecordDb.getAll();

  // hospital_staff → ABAC filter: only records from their hospital.
  if (auth.ctx.role === 'hospital_staff') {
    data = data.filter((r) => r.hospitalId === auth.ctx.linkedId);
    return NextResponse.json({ success: true, data, matched: 'RBAC+ABAC' });
  }
  return NextResponse.json({ success: true, data, matched: decision.matched });
}

export async function POST(request: Request) {
  const auth = await authenticate(request);
  if (auth.kind === 'failure') return auth.response;
  const denied = authorize(canCreateMedicalRecord(auth.ctx));
  if (denied) return denied;

  const body = await request.json();

  // hospital_staff: force hospitalId to own hospital (can't create on behalf of others).
  if (auth.ctx.role === 'hospital_staff') {
    body.hospitalId = auth.ctx.linkedId;
  }

  const id = await medicalRecordDb.create(body);

  // Defence in depth
  const created = await medicalRecordDb.get(id);
  if (created) {
    const viewCheck = canViewMedicalRecord(auth.ctx, created);
    if (!viewCheck.allow) {
      return NextResponse.json(
        { success: false, error: 'Data dibuat tapi tidak dapat diakses', id },
        { status: 201 },
      );
    }
  }
  return NextResponse.json({ success: true, id }, { status: 201 });
}
