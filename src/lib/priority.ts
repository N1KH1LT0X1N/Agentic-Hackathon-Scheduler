import { Hackathon, TeamPreferences } from '@prisma/client';

export function computePriorityScore(
  hackathon: Hackathon,
  prefs: TeamPreferences,
  teamSkills: string[],
) {
  let score = 0;

  if (hackathon.prizePool) {
    score += Math.min(hackathon.prizePool / 10000, 5);
    if (prefs.minPrizeAmount && hackathon.prizePool >= prefs.minPrizeAmount) {
      score += 2;
    }
  }

  const matchedThemes = hackathon.themes.filter((theme) =>
    prefs.preferredThemes?.some((pref) => pref.toLowerCase() === theme.toLowerCase()),
  );
  score += matchedThemes.length * 1.5;

  const skillBoost = hackathon.themes.filter((theme) =>
    teamSkills.some((skill) => skill.toLowerCase() === theme.toLowerCase()),
  );
  score += skillBoost.length;

  const now = new Date();
  const deadline = hackathon.registrationDeadline ?? hackathon.startDate ?? hackathon.endDate;
  if (deadline && deadline.getTime() > now.getTime()) {
    const diffDays = (deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    if (diffDays <= 7) {
      score += 2;
    } else if (diffDays <= 21) {
      score += 1;
    }
  }

  if (prefs.locationPreference === 'ONLINE_ONLY' && hackathon.locationType === 'OFFLINE') {
    score -= 3;
  }
  if (prefs.locationPreference === 'OFFLINE_ONLY' && hackathon.locationType === 'ONLINE') {
    score -= 3;
  }

  return Math.max(0, Number(score.toFixed(2)));
}
