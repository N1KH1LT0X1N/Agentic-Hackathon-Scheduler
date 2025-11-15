import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireUser } from '@/lib/auth';
import { callLLM } from '@/lib/llm';

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { teamId } = await requireUser(request);
    const [teamHackathon, prefs, project, tasks] = await Promise.all([
      prisma.teamHackathon.findFirst({
        where: { id: params.id, teamId },
        include: { hackathon: { include: { platform: true } } },
      }),
      prisma.teamPreferences.findUnique({ where: { teamId } }),
      prisma.project.findUnique({ where: { teamHackathonId: params.id } }),
      prisma.task.findMany({ where: { teamHackathonId: params.id } }),
    ]);

    if (!teamHackathon || !prefs) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const body = await request.json();
    const messages: ChatMessage[] = body.messages ?? [];
    const systemPrompt = `You are an AI assistant for the hackathon ${teamHackathon.hackathon.title}. Provide tactical guidance using the latest context.`;
    const response = await callLLM(systemPrompt, {
      messages,
      hackathon: teamHackathon.hackathon,
      preferences: prefs,
      project,
      tasks,
    });
    return NextResponse.json({ reply: response.content });
  } catch (error) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}
