import { redirect } from 'next/navigation';
import { DiscoverView } from '@/components/discover-view';
import { getCurrentUser } from '@/lib/auth';

export default async function DiscoverPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }
  return <DiscoverView />;
}
