import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireUser } from '@/lib/auth';
import { formatErrorResponse } from '@/lib/api-errors';

export async function GET(request: NextRequest) {
  try {
    const { teamId } = await requireUser(request);
    const hacks = await prisma.teamHackathon.findMany({ where: { teamId } });

    const total = hacks.length;
    const watching = hacks.filter((hack) => hack.status === 'WATCHING').length;
    const registered = hacks.filter((hack) => hack.status === 'REGISTERED').length;
    const building = hacks.filter((hack) => hack.status === 'BUILDING').length;
    const submitted = hacks.filter((hack) => hack.status === 'SUBMITTED').length;
    const skipped = hacks.filter((hack) => hack.status === 'SKIPPED').length;

    const won = hacks.filter((hack) => hack.pastResult === 'WON').length;
    const shortlisted = hacks.filter((hack) => hack.pastResult === 'SHORTLISTED').length;
    const participated = hacks.filter((hack) => hack.pastResult === 'PARTICIPATED').length;

    return NextResponse.json({
      total,
      watching,
      registered,
      building,
      submitted,
      skipped,
      won,
      shortlisted,
      participated,
    });
  } catch (error) {
    return formatErrorResponse(error);
  }
}
