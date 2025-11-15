import { NextRequest, NextResponse } from 'next/server';
import { runActiveScrapers } from '@/lib/hackathon-sync';

export async function POST() {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not available' }, { status: 403 });
  }
  const result = await runActiveScrapers();
  return NextResponse.json(result);
}
