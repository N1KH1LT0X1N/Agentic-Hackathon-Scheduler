export type HackathonStage = 'watching' | 'shortlisted' | 'committed';

export interface HackathonOpportunity {
  id: string;
  name: string;
  region: string;
  format: 'online' | 'in-person' | 'hybrid';
  startDate: string;
  endDate: string;
  focusAreas: string[];
  prizePool: string;
  applicationStatus: 'Open' | 'Invited' | 'Upcoming';
  confidence: number; // 0-1
  stage: HackathonStage;
  owner: string;
  notes: string;
}

export const hackathonPipeline: HackathonOpportunity[] = [
  {
    id: 'ai-frontier',
    name: 'AI Frontiers Summit Hack',
    region: 'San Francisco, USA',
    format: 'in-person',
    startDate: '2025-01-16',
    endDate: '2025-01-19',
    focusAreas: ['Agentic Runtimes', 'Developer Experience'],
    prizePool: '$125k',
    applicationStatus: 'Open',
    confidence: 0.72,
    stage: 'committed',
    owner: 'Nova Pod',
    notes: 'Need to confirm travel budgets + AI demo hardware shipment.',
  },
  {
    id: 'med-build',
    name: 'Global Health Buildathon',
    region: 'Berlin, Germany',
    format: 'hybrid',
    startDate: '2024-12-05',
    endDate: '2024-12-08',
    focusAreas: ['MedTech', 'LLM Agents'],
    prizePool: '$80k',
    applicationStatus: 'Invited',
    confidence: 0.61,
    stage: 'shortlisted',
    owner: 'Clinical Ops',
    notes: 'Waiting on sponsor kit localization + legal sign-off.',
  },
  {
    id: 'green-stack',
    name: 'GreenStack Sustainability Hack',
    region: 'Remote / APAC friendly',
    format: 'online',
    startDate: '2025-02-10',
    endDate: '2025-02-17',
    focusAreas: ['Sustainability', 'Infra Automation'],
    prizePool: '$50k',
    applicationStatus: 'Upcoming',
    confidence: 0.55,
    stage: 'watching',
    owner: 'Velocity Pod',
    notes: 'Dependent on release of carbon benchmarking API beta.',
  },
];

export function getPipelineSummary() {
  const totals = hackathonPipeline.reduce(
    (acc, opportunity) => {
      acc[opportunity.stage] += 1;
      acc.confidence += opportunity.confidence;
      return acc;
    },
    { watching: 0, shortlisted: 0, committed: 0, confidence: 0 },
  );

  return {
    ...totals,
    avgConfidence: totals.confidence / hackathonPipeline.length,
  };
}
