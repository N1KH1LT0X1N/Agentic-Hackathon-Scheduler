import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireUser } from '@/lib/auth';
import { suggestPlanForHackathon, generateTasksFromPlan } from '@/lib/scheduler';
import { logEvent } from '@/lib/event-log';

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { teamId, user } = await requireUser(request);
    const teamHackathon = await prisma.teamHackathon.findFirst({
      where: { id: params.id, teamId },
      include: { hackathon: true },
    });
    if (!teamHackathon) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const plan = suggestPlanForHackathon(teamHackathon.hackathon);
    const tasks = generateTasksFromPlan(plan);

    await prisma.$transaction(async (tx) => {
      await tx.task.deleteMany({ where: { teamHackathonId: teamHackathon.id } });
      for (const task of tasks) {
        await tx.task.create({
          data: {
            teamHackathonId: teamHackathon.id,
            title: task.title,
            description: task.description,
            category: task.category,
            status: 'TODO',
            dueAt: task.dueAt,
          },
        });
      }
    });

    await logEvent({
      teamId,
      userId: user.id,
      teamHackathonId: teamHackathon.id,
      type: 'plan_generated',
      metadata: { phases: plan.phases.length },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}
