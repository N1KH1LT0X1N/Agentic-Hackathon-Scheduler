import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireUser } from '@/lib/auth';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { teamId } = await requireUser(request);
    const project = await prisma.project.findFirst({
      where: { teamHackathonId: params.id, teamHackathon: { teamId } },
    });
    return NextResponse.json(project);
  } catch (error) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { teamId } = await requireUser(request);
    const teamHackathon = await prisma.teamHackathon.findFirst({ where: { id: params.id, teamId } });
    if (!teamHackathon) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    const body = await request.json();
    const data = {
      name: body.name ?? 'Untitled project',
      shortDescription: body.shortDescription ?? '',
      techStack: body.techStack ?? [],
      githubRepoUrl: body.githubRepoUrl ?? null,
      demoUrl: body.demoUrl ?? null,
      pitchDeckUrl: body.pitchDeckUrl ?? null,
      coverImageUrl: body.coverImageUrl ?? null,
    };
    const project = await prisma.project.upsert({
      where: { teamHackathonId: params.id },
      update: data,
      create: {
        teamHackathonId: params.id,
        ...data,
      },
    });
    return NextResponse.json(project);
  } catch (error) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}
