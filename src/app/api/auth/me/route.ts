// ============================================================
// /api/auth/me
// Verify JWT (Firebase ID token) and return decoded claims.
// Demonstrates the JWT access-token flow end-to-end.
// ============================================================

import { NextResponse } from 'next/server';
import { authenticate } from '@/lib/auth/api-guard';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const result = await authenticate(request);
  if (result.kind === 'failure') return result.response;

  // The JWT header isn't returned by verifyIdToken; decode it from raw token.
  const [headerB64] = result.rawToken.split('.');
  const header = JSON.parse(Buffer.from(headerB64, 'base64url').toString('utf8'));

  return NextResponse.json({
    success: true,
    context: result.ctx,
    jwt: {
      header,
      payload: result.decoded,
      signature: '[RS256 verified by firebase-admin SDK]',
    },
  });
}
