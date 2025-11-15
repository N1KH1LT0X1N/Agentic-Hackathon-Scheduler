import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const { teamId } = await requireUser(request);
    const hacks = await prisma.teamHackathon.findMany({ where: { teamId } });
    const total = hacks.length;
    const submitted = hacks.filter((hack) => hack.status === 'SUBMITTED').length;
    const won = hacks.filter((hack) => hack.pastResult === 'WON').length;
    return NextResponse.json({ total, submitted, won });
  } catch (error) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}
