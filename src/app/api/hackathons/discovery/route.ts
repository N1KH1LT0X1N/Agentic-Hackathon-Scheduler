import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireUser } from '@/lib/auth';
import { ensureTeamPreferences } from '@/lib/team';
import { computePriorityScore } from '@/lib/priority';
import { formatErrorResponse } from '@/lib/api-errors';
import { Prisma } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    const { teamId } = await requireUser(request);
    const prefs = await ensureTeamPreferences(teamId);
    const teamMembers = await prisma.user.findMany({ where: { teamId } });
    const teamSkills = Array.from(new Set(teamMembers.flatMap((member) => member.skills || [])));

    // Extract query parameters
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const theme = searchParams.get('theme') || '';
    const locationType = searchParams.get('locationType') || '';
    const minPrize = searchParams.get('minPrize');
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '25', 10)));
    const skip = (page - 1) * limit;

    // Build where clause
    const where: Prisma.HackathonWhereInput = {
      AND: [
        {
          OR: [
            { startDate: { gte: new Date() } },
            { registrationDeadline: { gte: new Date() } },
          ],
        },
      ],
    };

    // Add search filter
    if (search) {
      where.AND?.push({
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { rawDescription: { contains: search, mode: 'insensitive' } },
        ],
      });
    }

    // Add theme filter
    if (theme) {
      where.AND?.push({
        themes: { has: theme },
      });
    }

    // Add location type filter
    if (locationType && ['ONLINE', 'OFFLINE', 'HYBRID'].includes(locationType)) {
      where.locationType = locationType as 'ONLINE' | 'OFFLINE' | 'HYBRID';
    }

    // Add minimum prize filter
    if (minPrize) {
      const minPrizeNum = parseInt(minPrize, 10);
      if (!isNaN(minPrizeNum) && minPrizeNum > 0) {
        where.prizePool = { gte: minPrizeNum };
      }
    }

    // Fetch hackathons with pagination
    const [hackathons, total] = await Promise.all([
      prisma.hackathon.findMany({
        where,
        include: { platform: true },
        orderBy: { startDate: 'asc' },
        skip,
        take: limit,
      }),
      prisma.hackathon.count({ where }),
    ]);

    const payload = hackathons.map((hackathon) => ({
      ...hackathon,
      platform: hackathon.platform,
      priorityScore: computePriorityScore(hackathon, prefs, teamSkills),
    }));

    return NextResponse.json({
      data: payload,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return formatErrorResponse(error);
  }
}
