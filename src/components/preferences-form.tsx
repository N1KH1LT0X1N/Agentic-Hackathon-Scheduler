'use client';

import { FormEvent, useEffect, useState } from 'react';

interface Preferences {
  preferredThemes: string[];
  minPrizeAmount: number | null;
  locationPreference: 'ONLINE_ONLY' | 'OFFLINE_ONLY' | 'BOTH';
  maxParallelHackathons: number;
}

const defaultPrefs: Preferences = {
  preferredThemes: [],
  minPrizeAmount: null,
  locationPreference: 'BOTH',
  maxParallelHackathons: 1,
};

export function PreferencesForm() {
  const [prefs, setPrefs] = useState<Preferences>(defaultPrefs);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/team/preferences')
      .then((res) => res.json())
      .then((json) => setPrefs({
        preferredThemes: json.preferredThemes ?? [],
        minPrizeAmount: json.minPrizeAmount ?? null,
        locationPreference: json.locationPreference ?? 'BOTH',
        maxParallelHackathons: json.maxParallelHackathons ?? 1,
      }))
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setMessage(null);
    await fetch('/api/team/preferences', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(prefs),
    });
    setMessage('Preferences saved');
  };

  if (loading) {
    return <p className="text-sm text-slate-400">Loading preferences…</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="text-sm text-slate-300">Preferred themes</label>
        <input
          className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900/60 px-3 py-2 text-white"
          value={prefs.preferredThemes.join(', ')}
          onChange={(event) =>
            setPrefs({ ...prefs, preferredThemes: event.target.value.split(',').map((item) => item.trim()).filter(Boolean) })
          }
          placeholder="AI, Climate, Health"
        />
      </div>
      <div>
        <label className="text-sm text-slate-300">Minimum prize amount</label>
        <input
          type="number"
          className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900/60 px-3 py-2 text-white"
          value={prefs.minPrizeAmount ?? ''}
          onChange={(event) => setPrefs({ ...prefs, minPrizeAmount: event.target.value ? Number(event.target.value) : null })}
        />
      </div>
      <div>
        <label className="text-sm text-slate-300">Location preference</label>
        <div className="mt-2 flex gap-4 text-sm text-slate-300">
          {['ONLINE_ONLY', 'OFFLINE_ONLY', 'BOTH'].map((value) => (
            <label key={value} className="flex items-center gap-2">
              <input
                type="radio"
                name="locationPreference"
                value={value}
                checked={prefs.locationPreference === value}
                onChange={() => setPrefs({ ...prefs, locationPreference: value as Preferences['locationPreference'] })}
              />
              {value.replace('_', ' ')}
            </label>
          ))}
        </div>
      </div>
      <div>
        <label className="text-sm text-slate-300">Max parallel hackathons</label>
        <input
          type="number"
          min={1}
          className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900/60 px-3 py-2 text-white"
          value={prefs.maxParallelHackathons}
          onChange={(event) => setPrefs({ ...prefs, maxParallelHackathons: Number(event.target.value) })}
        />
      </div>
      {message && <p className="text-sm text-emerald-300">{message}</p>}
      <button type="submit" className="rounded-lg bg-emerald-500 px-4 py-2 font-semibold text-emerald-950">
        Save preferences
      </button>
    </form>
  );
}
