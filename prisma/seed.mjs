import crypto from 'crypto';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const platforms = [
  { name: 'Devpost', baseUrl: 'https://devpost.com' },
  { name: 'Devfolio', baseUrl: 'https://devfolio.co' },
  { name: 'Unstop', baseUrl: 'https://unstop.com' },
  { name: 'HackerEarth', baseUrl: 'https://hackerearth.com' },
  { name: 'Hack2Skill', baseUrl: 'https://hack2skill.com' },
  { name: 'lablab.ai', baseUrl: 'https://lablab.ai' },
  { name: 'Devnovate', baseUrl: 'https://devnovate.com' },
  { name: 'Luma', baseUrl: 'https://lu.ma' },
];

async function main() {
  for (const platform of platforms) {
    await prisma.platform.upsert({
      where: { baseUrl: platform.baseUrl },
      update: { name: platform.name, isActive: true },
      create: { id: crypto.randomUUID(), name: platform.name, baseUrl: platform.baseUrl, isActive: true },
    });
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
