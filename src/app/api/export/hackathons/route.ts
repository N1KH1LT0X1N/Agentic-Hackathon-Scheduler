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
        project: true,
        tasks: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    if (format === 'csv') {
      // Generate CSV
      const headers = [
        'Hackathon Title',
        'Platform',
        'Status',
        'Result',
        'Start Date',
        'End Date',
        'Prize Pool',
        'Currency',
        'Location Type',
        'Priority Score',
        'Tasks Total',
        'Tasks Completed',
        'Created At',
      ];

      const rows = teamHackathons.map((th) => [
        th.hackathon.title,
        th.hackathon.platform.name,
        th.status,
        th.pastResult,
        th.hackathon.startDate?.toISOString() || '',
        th.hackathon.endDate?.toISOString() || '',
        th.hackathon.prizePool || '',
        th.hackathon.currency || '',
        th.hackathon.locationType,
        th.priorityScore.toFixed(2),
        th.tasks.length,
        th.tasks.filter((t) => t.status === 'DONE').length,
        th.createdAt.toISOString(),
      ]);

      const csv = [
        headers.join(','),
        ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
      ].join('\n');

      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="hackathons_${new Date().toISOString().split('T')[0]}.csv"`,
        },
      });
    }

    // Default to JSON
    const exportData = teamHackathons.map((th) => ({
      id: th.id,
      hackathon: {
        title: th.hackathon.title,
        platform: th.hackathon.platform.name,
        url: th.hackathon.url,
        startDate: th.hackathon.startDate,
        endDate: th.hackathon.endDate,
        registrationDeadline: th.hackathon.registrationDeadline,
        prizePool: th.hackathon.prizePool,
        currency: th.hackathon.currency,
        locationType: th.hackathon.locationType,
        city: th.hackathon.city,
        country: th.hackathon.country,
        themes: th.hackathon.themes,
      },
      status: th.status,
      result: th.pastResult,
      priorityScore: th.priorityScore,
      project: th.project ? {
        name: th.project.name,
        description: th.project.shortDescription,
        techStack: th.project.techStack,
        githubUrl: th.project.githubRepoUrl,
        demoUrl: th.project.demoUrl,
      } : null,
      tasks: {
        total: th.tasks.length,
        completed: th.tasks.filter((t) => t.status === 'DONE').length,
        todo: th.tasks.filter((t) => t.status === 'TODO').length,
        inProgress: th.tasks.filter((t) => t.status === 'IN_PROGRESS').length,
        blocked: th.tasks.filter((t) => t.status === 'BLOCKED').length,
      },
      createdAt: th.createdAt,
      updatedAt: th.updatedAt,
    }));

    return new NextResponse(JSON.stringify(exportData, null, 2), {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="hackathons_${new Date().toISOString().split('T')[0]}.json"`,
      },
    });
  } catch (error) {
    return formatErrorResponse(error);
  }
}
