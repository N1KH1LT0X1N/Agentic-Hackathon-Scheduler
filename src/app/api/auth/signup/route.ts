import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { attachSession, hashPassword } from '@/lib/auth';
import { slugify } from '@/lib/utils';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { name, email, password, teamName } = body ?? {};

  if (!name || !email || !password || !teamName) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    return NextResponse.json({ error: 'User already exists' }, { status: 409 });
  }

  const slugBase = slugify(teamName);
  let slug = slugBase;
  let suffix = 1;
  while (await prisma.team.findUnique({ where: { slug } })) {
    slug = `${slugBase}-${suffix++}`;
  }

  const hashedPassword = await hashPassword(password);

  const { team, user } = await prisma.$transaction(async (tx) => {
    const createdTeam = await tx.team.create({
      data: {
        name: teamName,
        slug,
      },
    });
    await tx.teamPreferences.create({
      data: {
        teamId: createdTeam.id,
        preferredThemes: [],
        locationPreference: 'BOTH',
        maxParallelHackathons: 1,
      },
    });
    const createdUser = await tx.user.create({
      data: {
        name,
        email,
        hashedPassword,
        teamId: createdTeam.id,
        timeZone: 'UTC',
        skills: [],
      },
    });
    return { team: createdTeam, user: createdUser };
  });

  const response = NextResponse.json({
    user: { id: user.id, name: user.name, email: user.email, teamId: team.id },
  });

  await attachSession(response, { userId: user.id, teamId: team.id } as const);
  return response;
}
