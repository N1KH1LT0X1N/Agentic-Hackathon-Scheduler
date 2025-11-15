import '@prisma/client';

declare module '@prisma/client' {
  interface PrismaClient {
    [key: string]: any;
  }

  type Platform = any;
  type Hackathon = any;
  type TeamPreferences = any;
  type TeamHackathon = any;
  type Task = any;
  type HackathonRequirement = any;
}
