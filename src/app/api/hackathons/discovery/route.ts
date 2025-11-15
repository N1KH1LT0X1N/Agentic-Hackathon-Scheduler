import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireUser } from '@/lib/auth';
import { ensureTeamPreferences } from '@/lib/team';
import { computePriorityScore } from '@/lib/priority';

export async function GET(request: NextRequest) {
  try {
    const { teamId } = await requireUser(request);
    const prefs = await ensureTeamPreferences(teamId);
    const teamMembers = await prisma.user.findMany({ where: { teamId } });
    const teamSkills = Array.from(new Set(teamMembers.flatMap((member) => member.skills || [])));

    const hackathons = await prisma.hackathon.findMany({
      where: {
        OR: [
          { startDate: { gte: new Date() } },
          { registrationDeadline: { gte: new Date() } },
        ],
      },
      include: { platform: true },
      orderBy: { startDate: 'asc' },
      take: 25,
    });

    const payload = hackathons.map((hackathon) => ({
      ...hackathon,
      platform: hackathon.platform,
      priorityScore: computePriorityScore(hackathon, prefs, teamSkills),
    }));

    return NextResponse.json(payload);
  } catch (error) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}
