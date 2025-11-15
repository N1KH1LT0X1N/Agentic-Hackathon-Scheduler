import { Hackathon } from '@prisma/client';

export interface PlanPhase {
  name: string;
  start: Date;
  end: Date;
}

export interface PlanResult {
  phases: PlanPhase[];
  submissionBufferHours: number;
}

const STANDARD_BUFFER_HOURS = 4;

export function suggestPlanForHackathon(hackathon: Hackathon): PlanResult {
  const now = new Date();
  const start = hackathon.startDate ?? now;
  const submission =
    hackathon.endDate ??
    hackathon.registrationDeadline ??
    new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  const safeSubmission = submission.getTime() > start.getTime() ? submission : new Date(start.getTime() + 24 * 60 * 60 * 1000);
  const totalDuration = safeSubmission.getTime() - start.getTime();
  const chunk = totalDuration / 3;

  const ideationEnd = new Date(start.getTime() + chunk);
  const buildEnd = new Date(ideationEnd.getTime() + chunk);
  const polishEnd = new Date(safeSubmission.getTime() - STANDARD_BUFFER_HOURS * 60 * 60 * 1000);

  return {
    submissionBufferHours: STANDARD_BUFFER_HOURS,
    phases: [
      { name: 'Ideation', start, end: ideationEnd },
      { name: 'Build', start: ideationEnd, end: buildEnd },
      { name: 'Polish & Submission', start: buildEnd, end: polishEnd },
    ],
  };
}

const TASK_LIBRARY = [
  { title: 'Understand problem', description: 'Digest the brief and judging criteria.', category: 'ideation' },
  { title: 'Research past winners', description: 'Collect insights from previous champions.', category: 'ideation' },
  { title: 'Define architecture', description: 'Outline system design and responsibilities.', category: 'build' },
  { title: 'Implement core features', description: 'Pair on the differentiators first.', category: 'build' },
  { title: 'Polish UX / bugfixes', description: 'Tighten flows, fix bugs, prep assets.', category: 'polish' },
  { title: 'Prepare deck', description: 'Craft the storytelling narrative.', category: 'polish' },
  { title: 'Record demo', description: 'Capture a clean walkthrough video.', category: 'polish' },
  { title: 'Submission dry run', description: 'Rehearse upload + checklist before deadline.', category: 'polish' },
];

export function generateTasksFromPlan(plan: PlanResult) {
  return TASK_LIBRARY.map((task, index) => {
    const phase = plan.phases[Math.min(plan.phases.length - 1, Math.floor(index / 3))];
    return {
      title: task.title,
      description: task.description,
      category: task.category,
      dueAt: phase?.end ?? plan.phases[plan.phases.length - 1].end,
    };
  });
}
