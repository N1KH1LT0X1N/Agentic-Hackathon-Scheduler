import { redirect } from 'next/navigation';
import { WorkspaceView } from '@/components/workspace-view';
import { getCurrentUser } from '@/lib/auth';

export default async function WorkspacePage({ params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }
  return <WorkspaceView teamHackathonId={params.id} />;
}
