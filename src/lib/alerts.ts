import { Hackathon, HackathonRequirement, Task, TeamHackathon } from '@prisma/client';

export interface Alert {
  teamHackathonId: string;
  severity: 'info' | 'warning' | 'critical';
  message: string;
}

export function computeAlerts(params: {
  teamHackathon: TeamHackathon & { hackathon: Hackathon };
  tasks: Task[];
  requirements: HackathonRequirement[];
}): Alert[] {
  const alerts: Alert[] = [];
  const { teamHackathon, tasks, requirements } = params;
  const hackathon = teamHackathon.hackathon;

  const deadline = hackathon.endDate ?? hackathon.registrationDeadline;
  const now = new Date();
  const incompleteTasks = tasks.filter((task) => task.status !== 'DONE');
  const overdueTasks = incompleteTasks.filter((task) => task.dueAt && task.dueAt < now);

  const checklistIncomplete = requirements.some((req) => {
    if (!Array.isArray(req.checklistJson)) return false;
    return (req.checklistJson as { label: string; completed?: boolean }[]).some((item) => !item.completed);
  });

  if (deadline) {
    const hoursLeft = (deadline.getTime() - now.getTime()) / (1000 * 60 * 60);
    if (hoursLeft <= 24 && (incompleteTasks.length > 0 || checklistIncomplete)) {
      alerts.push({
        teamHackathonId: teamHackathon.id,
        severity: 'critical',
        message: 'Submission due in <24h and there are unfinished items.',
      });
    }
  }

  if (overdueTasks.length > 0) {
    alerts.push({
      teamHackathonId: teamHackathon.id,
      severity: 'warning',
      message: `${overdueTasks.length} task(s) are overdue`,
    });
  }

  if (checklistIncomplete && !alerts.find((a) => a.severity === 'critical')) {
    alerts.push({
      teamHackathonId: teamHackathon.id,
      severity: 'info',
      message: 'Submission checklist still has items to review.',
    });
  }

  return alerts;
}
