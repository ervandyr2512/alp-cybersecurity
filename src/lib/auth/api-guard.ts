// ============================================================
// alp-cybersecurity — API Route Guard
// authenticate(request) → AuthContext (from JWT) or 401 Response
// authorize(policy)     → 403 Response or null (pass-through)
// ============================================================

import { NextResponse } from 'next/server';
import { getAdminAuth, getAdminDb } from '@/lib/firebase/admin';
import { DB_PATHS, type User } from '@/types';
import type { AuthContext, PolicyResult } from './policies';

type AuthFailure = { kind: 'failure'; response: NextResponse };
type AuthSuccess = { kind: 'ok'; ctx: AuthContext; rawToken: string; decoded: Record<string, unknown> };
export type AuthResult = AuthSuccess | AuthFailure;

/**
 * Extract JWT from Authorization header, verify, and hydrate with role+linkedId.
 * The token is the Firebase ID token (RS256 JWT issued by Google).
 */
export async function authenticate(request: Request): Promise<AuthResult> {
  const authHeader = request.headers.get('Authorization') ?? request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return {
      kind: 'failure',
      response: NextResponse.json(
        { success: false, error: 'Missing Authorization Bearer token', code: 'NO_TOKEN' },
        { status: 401 },
      ),
    };
  }

  const token = authHeader.slice(7).trim();
  let decoded;
  try {
    decoded = await getAdminAuth().verifyIdToken(token);
  } catch (err) {
    const reason = err instanceof Error ? err.message : 'Invalid token';
    return {
      kind: 'failure',
      response: NextResponse.json(
        { success: false, error: `Invalid JWT: ${reason}`, code: 'INVALID_TOKEN' },
        { status: 401 },
      ),
    };
  }

  // Fetch role + linkedId from Realtime DB profile.
  const snap = await getAdminDb().ref(`${DB_PATHS.USERS}/${decoded.uid}`).get();
  if (!snap.exists()) {
    return {
      kind: 'failure',
      response: NextResponse.json(
        { success: false, error: 'User profile not found', code: 'NO_PROFILE' },
        { status: 401 },
      ),
    };
  }
  const profile = snap.val() as Omit<User, 'uid'>;

  const ctx: AuthContext = {
    uid: decoded.uid,
    email: decoded.email ?? profile.email,
    role: profile.role,
    linkedId: profile.linkedId,
  };
  return { kind: 'ok', ctx, rawToken: token, decoded: decoded as unknown as Record<string, unknown> };
}

/**
 * Turn a PolicyResult into an error response (null if allowed).
 */
export function authorize(result: PolicyResult): NextResponse | null {
  if (result.allow) return null;
  return NextResponse.json(
    { success: false, error: result.reason, code: 'FORBIDDEN', matched: result.matched },
    { status: 403 },
  );
}

/**
 * Convenience: wrap authenticate + policy in one call.
 * Returns either a Response (short-circuit) OR the AuthContext (caller proceeds).
 */
export async function guard(
  request: Request,
  policy: (ctx: AuthContext) => PolicyResult,
): Promise<NextResponse | AuthContext> {
  const authResult = await authenticate(request);
  if (authResult.kind === 'failure') return authResult.response;
  const decision = policy(authResult.ctx);
  if (!decision.allow) return authorize(decision)!;
  return authResult.ctx;
}
