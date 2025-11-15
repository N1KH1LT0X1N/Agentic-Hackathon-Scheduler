import { redirect } from 'next/navigation';
import { PreferencesForm } from '@/components/preferences-form';
import { getCurrentUser } from '@/lib/auth';

export default async function PreferencesPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-semibold text-white">Team preferences</h2>
        <p className="text-sm text-slate-400">Align the feed with what your team cares about.</p>
      </div>
      <PreferencesForm />
    </div>
  );
}
