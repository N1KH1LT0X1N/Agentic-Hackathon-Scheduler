import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireUser } from '@/lib/auth';
import { formatErrorResponse } from '@/lib/api-errors';

export async function GET(request: NextRequest) {
  try {
    const { teamId } = await requireUser(request);
    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'json';

    const teamHackathons = await prisma.teamHackathon.findMany({
      where: { teamId },
      include: {
        hackathon: {
          include: {
            platform: true,
          },
        },
      },
    });

    // Aggregate statistics
    const stats = {
      overview: {
        total: teamHackathons.length,
        watching: teamHackathons.filter((th) => th.status === 'WATCHING').length,
        registered: teamHackathons.filter((th) => th.status === 'REGISTERED').length,
        building: teamHackathons.filter((th) => th.status === 'BUILDING').length,
        submitted: teamHackathons.filter((th) => th.status === 'SUBMITTED').length,
        won: teamHackathons.filter((th) => th.pastResult === 'WON').length,
        shortlisted: teamHackathons.filter((th) => th.pastResult === 'SHORTLISTED').length,
      },
      byPlatform: {} as Record<string, number>,
      byTheme: {} as Record<string, { participated: number; won: number }>,
      byLocationType: {
        ONLINE: 0,
        OFFLINE: 0,
        HYBRID: 0,
      },
      totalPrizePool: 0,
    };

    teamHackathons.forEach((th) => {
      // Platform stats
      const platformName = th.hackathon.platform.name;
      stats.byPlatform[platformName] = (stats.byPlatform[platformName] || 0) + 1;

      // Theme stats
      th.hackathon.themes.forEach((theme) => {
        if (!stats.byTheme[theme]) {
          stats.byTheme[theme] = { participated: 0, won: 0 };
        }
        stats.byTheme[theme].participated += 1;
        if (th.pastResult === 'WON') {
          stats.byTheme[theme].won += 1;
        }
      });

      // Location type
      stats.byLocationType[th.hackathon.locationType]++;

      // Prize pool (only for won hackathons)
      if (th.pastResult === 'WON' && th.hackathon.prizePool) {
        stats.totalPrizePool += th.hackathon.prizePool;
      }
    });

    if (format === 'csv') {
      // Generate CSV for theme statistics
      const headers = ['Theme', 'Participated', 'Won', 'Win Rate (%)'];
      const rows = Object.entries(stats.byTheme).map(([theme, data]) => [
        theme,
        data.participated.toString(),
        data.won.toString(),
        data.participated > 0 ? ((data.won / data.participated) * 100).toFixed(1) : '0',
      ]);

      const csv = [
        headers.join(','),
        ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
      ].join('\n');

      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="analytics_${new Date().toISOString().split('T')[0]}.csv"`,
        },
      });
    }

    // Return JSON
    return new NextResponse(JSON.stringify(stats, null, 2), {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="analytics_${new Date().toISOString().split('T')[0]}.json"`,
      },
    });
  } catch (error) {
    return formatErrorResponse(error);
  }
}
