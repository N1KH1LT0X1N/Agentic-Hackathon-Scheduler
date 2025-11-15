import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const { teamId } = await requireUser(request);
    const teamHackathons = await prisma.teamHackathon.findMany({
      where: { teamId },
      include: {
        hackathon: {
          include: { platform: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(teamHackathons);
  } catch (error) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}
