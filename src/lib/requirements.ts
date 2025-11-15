import { prisma } from './prisma';

export interface ChecklistItem {
  label: string;
  type: string;
  completed: boolean;
}

const KNOWN_ITEMS: { type: string; label: string; matchers: RegExp[] }[] = [
  {
    type: 'github',
    label: 'GitHub repository URL',
    matchers: [/github/i, /source code/i],
  },
  {
    type: 'demo',
    label: 'Live demo link',
    matchers: [/demo/i, /product link/i],
  },
  {
    type: 'video',
    label: 'Submission video',
    matchers: [/video/i, /recording/i],
  },
  {
    type: 'deck',
    label: 'Pitch deck',
    matchers: [/deck/i, /slides/i],
  },
  {
    type: 'cover',
    label: 'Cover image',
    matchers: [/cover/i, /thumbnail/i],
  },
];

export function parseChecklistFromText(rawText: string): ChecklistItem[] {
  const lower = rawText.toLowerCase();
  const detected: ChecklistItem[] = [];
  for (const item of KNOWN_ITEMS) {
    if (item.matchers.some((regex) => regex.test(lower))) {
      detected.push({ label: item.label, type: item.type, completed: false });
    }
  }
  if (detected.length === 0) {
    detected.push({ label: 'General submission package', type: 'general', completed: false });
  }
  return detected;
}

export async function validateSubmission(teamHackathonId: string) {
  const [project, requirements] = await Promise.all([
    prisma.project.findUnique({ where: { teamHackathonId } }),
    prisma.hackathonRequirement.findMany({ where: { teamHackathonId } }),
  ]);

  const checklistItems = requirements.flatMap((req) => req.checklistJson as ChecklistItem[]);
  const missing: string[] = [];

  for (const item of checklistItems) {
    if (item.type === 'github' && !project?.githubRepoUrl) {
      missing.push('GitHub repository URL');
    }
    if (item.type === 'demo' && !project?.demoUrl) {
      missing.push('Demo URL');
    }
    if (item.type === 'video' && !project?.demoUrl) {
      missing.push('Video / demo link');
    }
    if (item.type === 'deck' && !project?.pitchDeckUrl) {
      missing.push('Pitch deck URL');
    }
    if (item.type === 'cover' && !project?.coverImageUrl) {
      missing.push('Cover image URL');
    }
  }

  return { missing, checklist: checklistItems };
}
