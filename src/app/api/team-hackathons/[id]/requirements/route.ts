import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireUser } from '@/lib/auth';

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { teamId } = await requireUser(request);
    const requirement = await prisma.hackathonRequirement.findFirst({
      where: { teamHackathonId: params.id, teamHackathon: { teamId } },
    });
    if (!requirement) {
      return NextResponse.json({ error: 'Requirement not found' }, { status: 404 });
    }
    const body = await request.json();
    const updated = await prisma.hackathonRequirement.update({
      where: { id: requirement.id },
      data: { checklistJson: body.checklist ?? requirement.checklistJson },
    });
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}
