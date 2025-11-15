import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from './prisma';

const SESSION_COOKIE = 'hc_session';
const SESSION_SECRET = process.env.SESSION_SECRET ?? 'hackathon-copilot-secret';
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days

export interface SessionPayload {
  userId: string;
  teamId: string;
  issuedAt: number;
}

export async function hashPassword(password: string) {
  const salt = crypto.randomBytes(16).toString('hex');
  const derived = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${derived}`;
}

export async function verifyPassword(password: string, hashed: string) {
  const [salt, derived] = hashed.split(':');
  if (!salt || !derived) return false;
  const hashedBuffer = Buffer.from(derived, 'hex');
  const verifyBuffer = crypto.scryptSync(password, salt, 64);
  return crypto.timingSafeEqual(hashedBuffer, verifyBuffer);
}

function signSession(payload: SessionPayload) {
  const data = JSON.stringify(payload);
  const encoded = Buffer.from(data).toString('base64url');
  const signature = crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(encoded)
    .digest('base64url');
  return `${encoded}.${signature}`;
}

function parseSession(token: string | undefined | null): SessionPayload | null {
  if (!token) return null;
  const [encoded, signature] = token.split('.');
  if (!encoded || !signature) return null;
  const expected = crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(encoded)
    .digest('base64url');
  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) {
    return null;
  }
  try {
    const json = Buffer.from(encoded, 'base64url').toString('utf8');
    return JSON.parse(json) as SessionPayload;
  } catch (error) {
    return null;
  }
}

function setSessionCookie(response: NextResponse, payload: SessionPayload) {
  const token = signSession(payload);
  response.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_TTL_SECONDS,
    path: '/',
  });
  return response;
}

export function clearSessionCookie(response: NextResponse) {
  response.cookies.set(SESSION_COOKIE, '', { path: '/', maxAge: 0 });
  return response;
}

export async function createSessionResponse(payload: Omit<SessionPayload, 'issuedAt'>) {
  const response = NextResponse.json({ ok: true });
  setSessionCookie(response, { ...payload, issuedAt: Date.now() });
  return response;
}

export async function attachSession(response: NextResponse, payload: Omit<SessionPayload, 'issuedAt'>) {
  setSessionCookie(response, { ...payload, issuedAt: Date.now() });
  return response;
}

export function getSessionFromRequest(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  return parseSession(token ?? null);
}

export function getSessionFromCookiesStore() {
  const cookieStore = cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  return parseSession(token ?? null);
}

export async function getCurrentUser() {
  const session = getSessionFromCookiesStore();
  if (!session) return null;
  return prisma.user.findUnique({
    where: { id: session.userId },
    include: { team: true },
  });
}

export async function requireUser(request: NextRequest) {
  const session = getSessionFromRequest(request);
  if (!session) {
    throw new Error('UNAUTHORIZED');
  }
  const user = await prisma.user.findUnique({ where: { id: session.userId } });
  if (!user) {
    throw new Error('UNAUTHORIZED');
  }
  return { user, teamId: session.teamId };
}

export function withSession(response: NextResponse, payload: SessionPayload) {
  setSessionCookie(response, payload);
  return response;
}
