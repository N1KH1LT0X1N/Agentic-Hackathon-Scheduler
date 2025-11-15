import { prisma } from './prisma';

interface EventMetadata {
  [key: string]: unknown;
}

export async function logEvent(params: {
  teamId: string;
  userId?: string | null;
  teamHackathonId?: string | null;
  type: string;
  metadata?: EventMetadata;
}) {
  return prisma.eventLog.create({
    data: {
      teamId: params.teamId,
      userId: params.userId ?? null,
      teamHackathonId: params.teamHackathonId ?? null,
      type: params.type,
      metadata: params.metadata ?? {},
    },
  });
}
