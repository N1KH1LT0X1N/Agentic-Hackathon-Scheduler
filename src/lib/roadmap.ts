export type PhaseStatus = 'complete' | 'in-progress' | 'blocked';

export interface PhaseChecklistItem {
  title: string;
  detail: string;
  owner: string;
  status: 'done' | 'todo';
}

export interface PhaseDefinition {
  id: string;
  name: string;
  summary: string;
  status: PhaseStatus;
  checklist: PhaseChecklistItem[];
}

export const roadmap: PhaseDefinition[] = [
  {
    id: 'phase-0',
    name: 'Foundation',
    summary:
      'Next.js, Tailwind, and Prisma wiring are confirmed. Health checks and linting guardrails are ready.',
    status: 'complete',
    checklist: [
      {
        title: 'Next.js App Router ready',
        detail: 'Base layout and typography tokens established.',
        owner: 'Platform',
        status: 'done',
      },
      {
        title: 'Database + Prisma wiring',
        detail: 'Connection helpers in place for future migrations.',
        owner: 'Platform',
        status: 'done',
      },
      {
        title: 'API health route',
        detail: 'Simple GET endpoint confirms infra availability.',
        owner: 'Platform',
        status: 'done',
      },
    ],
  },
  {
    id: 'phase-1',
    name: 'Opportunity Radar',
    summary:
      'Surface the top hackathons, their readiness, and the team plan so we can engage sponsors quickly.',
    status: 'in-progress',
    checklist: [
      {
        title: 'Curated hackathon pipeline',
        detail: 'Consolidate the 90-day event funnel with scoring.',
        owner: 'Ops',
        status: 'done',
      },
      {
        title: 'Team readiness signals',
        detail: 'Assign pod owners and flag hiring needs.',
        owner: 'People',
        status: 'todo',
      },
      {
        title: 'Sponsor pitch kit',
        detail: 'Bundle decks + AI demos tailored per event.',
        owner: 'Product Marketing',
        status: 'todo',
      },
    ],
  },
  {
    id: 'phase-2',
    name: 'Execution Orchestration',
    summary:
      'Automations for travel, judging collateral, and AI-driven scoring pipeline will unlock here.',
    status: 'blocked',
    checklist: [],
  },
];

export function isFoundationReady() {
  return roadmap.some((phase) => phase.id === 'phase-0' && phase.status === 'complete');
}
