import { redirect } from 'next/navigation';
import { AnalyticsView } from '@/components/analytics-view';
import { getCurrentUser } from '@/lib/auth';

export default async function AnalyticsPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }
  return <AnalyticsView />;
}
