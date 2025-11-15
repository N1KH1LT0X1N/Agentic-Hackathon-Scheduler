import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireUser } from '@/lib/auth';
import { ensureTeamPreferences } from '@/lib/team';

export async function GET(request: NextRequest) {
  try {
    const { teamId } = await requireUser(request);
    const prefs = await ensureTeamPreferences(teamId);
    return NextResponse.json(prefs);
  } catch (error) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { teamId } = await requireUser(request);
    const body = await request.json();
    const { preferredThemes = [], minPrizeAmount = null, locationPreference = 'BOTH', maxParallelHackathons = 1 } = body ?? {};
    const updated = await prisma.teamPreferences.upsert({
      where: { teamId },
      update: {
        preferredThemes,
        minPrizeAmount,
        locationPreference,
        maxParallelHackathons,
      },
      create: {
        teamId,
        preferredThemes,
        minPrizeAmount,
        locationPreference,
        maxParallelHackathons,
      },
    });
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}
