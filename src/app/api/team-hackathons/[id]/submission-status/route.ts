import { NextRequest, NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { validateSubmission } from '@/lib/requirements';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { teamId } = await requireUser(request);
    const teamHackathon = await prisma.teamHackathon.findFirst({ where: { id: params.id, teamId } });
    if (!teamHackathon) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    const validation = await validateSubmission(teamHackathon.id);
    return NextResponse.json(validation);
  } catch (error) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}
