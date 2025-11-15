import { redirect } from 'next/navigation';
import { CommandCenterView } from '@/components/command-center-view';
import { getCurrentUser } from '@/lib/auth';

export default async function CommandCenterPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }
  return <CommandCenterView />;
}
