import { redirect } from 'next/navigation';
import { AuthForm } from '@/components/auth-form';
import { getCurrentUser } from '@/lib/auth';

export default async function SignupPage() {
  const user = await getCurrentUser();
  if (user) {
    redirect('/command-center');
  }
  return (
    <div className="mx-auto max-w-md space-y-6 rounded-2xl border border-slate-800 bg-slate-900/60 p-8">
      <div>
        <h2 className="text-2xl font-semibold text-white">Create a team</h2>
        <p className="text-sm text-slate-400">Spin up a workspace for your hackathon squad.</p>
      </div>
      <AuthForm mode="signup" />
    </div>
  );
}
