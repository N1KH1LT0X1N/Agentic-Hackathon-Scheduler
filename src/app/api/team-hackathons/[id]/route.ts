import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireUser } from '@/lib/auth';
import { ensureTeamPreferences } from '@/lib/team';
import { computePriorityScore } from '@/lib/priority';
import { logEvent } from '@/lib/event-log';

async function buildUserContext(request: NextRequest) {
  const { user, teamId } = await requireUser(request);
  return { teamId, userId: user.id };
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { teamId } = await requireUser(request);
    const record = await prisma.teamHackathon.findFirst({
      where: { id: params.id, teamId },
      include: { hackathon: { include: { platform: true } }, requirements: true },
    });
    if (!record) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    return NextResponse.json(record);
  } catch (error) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { teamId, userId } = await buildUserContext(request);
    const existing = await prisma.teamHackathon.findFirst({ where: { id: params.id, teamId } });
    if (!existing) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    const body = await request.json();
    const updated = await prisma.teamHackathon.update({
      where: { id: existing.id },
      data: {
        status: body.status ?? existing.status,
        pastResult: body.pastResult ?? existing.pastResult,
      },
    });

    if (body.status === 'SUBMITTED') {
      await logEvent({ teamId, userId, teamHackathonId: updated.id, type: 'status_submitted' });
    }
    if (body.pastResult === 'WON') {
      await logEvent({ teamId, userId, teamHackathonId: updated.id, type: 'status_won' });
    }
    if (body.pastResult === 'SHORTLISTED') {
      await logEvent({ teamId, userId, teamHackathonId: updated.id, type: 'status_shortlisted' });
    }

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { teamId, userId } = await buildUserContext(request);
    const hackathon = await prisma.hackathon.findUnique({ where: { id: params.id } });
    if (!hackathon) {
      return NextResponse.json({ error: 'Hackathon not found' }, { status: 404 });
    }
    const prefs = await ensureTeamPreferences(teamId);
    const teamMembers = await prisma.user.findMany({ where: { teamId } });
    const score = computePriorityScore(hackathon, prefs, teamMembers.flatMap((member) => member.skills || []));
    const created = await prisma.teamHackathon.upsert({
      where: { teamId_hackathonId: { teamId, hackathonId: hackathon.id } },
      update: { priorityScore: score },
      create: {
        teamId,
        hackathonId: hackathon.id,
        status: 'WATCHING',
        priorityScore: score,
      },
    });
    await logEvent({
      teamId,
      userId,
      teamHackathonId: created.id,
      type: 'team_hackathon_created',
      metadata: { priorityScore: score },
    });
    return NextResponse.json(created);
  } catch (error) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}
