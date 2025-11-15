import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const { teamId } = await requireUser(request);
    const hacks = await prisma.teamHackathon.findMany({
      where: { teamId },
      include: { hackathon: true },
    });
    const themeMap: Record<string, { participated: number; won: number }> = {};
    for (const hack of hacks) {
      const participated = hack.status !== 'WATCHING' && hack.status !== 'SKIPPED';
      for (const theme of hack.hackathon.themes ?? []) {
        if (!themeMap[theme]) {
          themeMap[theme] = { participated: 0, won: 0 };
        }
        if (participated) {
          themeMap[theme].participated += 1;
        }
        if (hack.pastResult === 'WON') {
          themeMap[theme].won += 1;
        }
      }
    }
    return NextResponse.json(themeMap);
  } catch (error) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}
