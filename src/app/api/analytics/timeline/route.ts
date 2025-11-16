import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireUser } from '@/lib/auth';
import { formatErrorResponse } from '@/lib/api-errors';
import { format, subMonths, startOfMonth } from 'date-fns';

export async function GET(request: NextRequest) {
  try {
    const { teamId } = await requireUser(request);

    // Get hackathons from last 12 months
    const twelveMonthsAgo = subMonths(new Date(), 12);

    const teamHackathons = await prisma.teamHackathon.findMany({
      where: {
        teamId,
        createdAt: {
          gte: twelveMonthsAgo,
        },
      },
      include: {
        hackathon: true,
      },
    });

    // Group by month
    const monthlyData: Record<string, { participated: number; won: number }> = {};

    teamHackathons.forEach((th) => {
      const month = format(startOfMonth(th.createdAt), 'MMM yyyy');

      if (!monthlyData[month]) {
        monthlyData[month] = { participated: 0, won: 0 };
      }

      if (th.status === 'SUBMITTED' || th.pastResult !== 'NONE') {
        monthlyData[month].participated += 1;
      }

      if (th.pastResult === 'WON') {
        monthlyData[month].won += 1;
      }
    });

    // Convert to array and sort by date
    const timeline = Object.entries(monthlyData)
      .map(([month, data]) => ({
        month,
        participated: data.participated,
        won: data.won,
      }))
      .sort((a, b) => {
        const dateA = new Date(a.month);
        const dateB = new Date(b.month);
        return dateA.getTime() - dateB.getTime();
      });

    return NextResponse.json(timeline);
  } catch (error) {
    return formatErrorResponse(error);
  }
}
