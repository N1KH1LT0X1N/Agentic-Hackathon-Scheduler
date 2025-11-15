import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireUser } from '@/lib/auth';
import { computeAlerts } from '@/lib/alerts';

export async function GET(request: NextRequest) {
  try {
    const { teamId } = await requireUser(request);
    const teamHackathons = await prisma.teamHackathon.findMany({
      where: { teamId },
      include: { hackathon: true },
    });
    const tasks = await prisma.task.findMany({ where: { teamHackathon: { teamId } } });
    const requirements = await prisma.hackathonRequirement.findMany({
      where: { teamHackathon: { teamId } },
    });

    const alerts = teamHackathons.flatMap((teamHackathon) => {
      const relatedTasks = tasks.filter((task) => task.teamHackathonId === teamHackathon.id);
      const relatedRequirements = requirements.filter((req) => req.teamHackathonId === teamHackathon.id);
      return computeAlerts({ teamHackathon: { ...teamHackathon, hackathon: teamHackathon.hackathon }, tasks: relatedTasks, requirements: relatedRequirements });
    });

    return NextResponse.json(alerts);
  } catch (error) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}
