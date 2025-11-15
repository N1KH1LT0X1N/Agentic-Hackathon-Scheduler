import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireUser } from '@/lib/auth';
import { callLLM } from '@/lib/llm';
import { parseChecklistFromText } from '@/lib/requirements';

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { teamId } = await requireUser(request);
    const teamHackathon = await prisma.teamHackathon.findFirst({
      where: { id: params.id, teamId },
      include: { hackathon: true },
    });
    if (!teamHackathon) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const body = await request.json();
    const rawText = body.rawText ?? '';
    const llmResponse = await callLLM('Extract submission requirements', { rawText });
    const checklist = parseChecklistFromText(`${rawText}\n${llmResponse.content}`);

    await prisma.hackathonRequirement.deleteMany({ where: { teamHackathonId: teamHackathon.id } });
    const requirement = await prisma.hackathonRequirement.create({
      data: {
        teamHackathonId: teamHackathon.id,
        rawText,
        checklistJson: checklist,
      },
    });

    return NextResponse.json(requirement);
  } catch (error) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}
