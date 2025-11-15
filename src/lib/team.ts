import { prisma } from './prisma';

export async function ensureTeamPreferences(teamId: string) {
  const existing = await prisma.teamPreferences.findUnique({ where: { teamId } });
  if (existing) return existing;
  return prisma.teamPreferences.create({
    data: {
      teamId,
      preferredThemes: [],
      locationPreference: 'BOTH',
      maxParallelHackathons: 1,
    },
  });
}
