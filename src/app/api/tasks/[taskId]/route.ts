import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireUser } from '@/lib/auth';
import { logEvent } from '@/lib/event-log';

export async function PATCH(request: NextRequest, { params }: { params: { taskId: string } }) {
  try {
    const { teamId, user } = await requireUser(request);
    const task = await prisma.task.findFirst({
      where: { id: params.taskId, teamHackathon: { teamId } },
    });
    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }
    const body = await request.json();
    const updated = await prisma.task.update({
      where: { id: task.id },
      data: {
        status: body.status ?? task.status,
        dueAt: body.dueAt ?? task.dueAt,
        assigneeUserId: body.assigneeUserId ?? task.assigneeUserId,
      },
    });

    if (body.status === 'DONE') {
      await logEvent({ teamId, userId: user.id, teamHackathonId: updated.teamHackathonId, type: 'task_completed', metadata: { taskId: updated.id } });
    }

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}
