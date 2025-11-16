import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireUser } from '@/lib/auth';
import { ensureTeamPreferences } from '@/lib/team';
import { formatErrorResponse, ValidationError } from '@/lib/api-errors';

export async function GET(request: NextRequest) {
  try {
    const { teamId } = await requireUser(request);
    const prefs = await ensureTeamPreferences(teamId);
    return NextResponse.json(prefs);
  } catch (error) {
    return formatErrorResponse(error);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { teamId } = await requireUser(request);
    const body = await request.json();
    const { preferredThemes = [], minPrizeAmount = null, locationPreference = 'BOTH', maxParallelHackathons = 1 } = body ?? {};

    // Validation
    if (maxParallelHackathons < 1 || maxParallelHackathons > 10) {
      throw new ValidationError('Invalid maxParallelHackathons', {
        maxParallelHackathons: 'Must be between 1 and 10',
      });
    }

    if (minPrizeAmount !== null && minPrizeAmount < 0) {
      throw new ValidationError('Invalid minPrizeAmount', {
        minPrizeAmount: 'Must be a positive number',
      });
    }

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
    return formatErrorResponse(error);
  }
}
