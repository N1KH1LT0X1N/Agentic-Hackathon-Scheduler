import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireUser } from '@/lib/auth';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { teamId } = await requireUser(request);
    const tasks = await prisma.task.findMany({
      where: { teamHackathonId: params.id, teamHackathon: { teamId } },
      orderBy: { dueAt: 'asc' },
    });
    return NextResponse.json(tasks);
  } catch (error) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}
