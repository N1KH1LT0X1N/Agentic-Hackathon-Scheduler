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
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetch('/api/team/preferences')
      .then((res) => res.json())
      .then((json) => {
        if (json.error) {
          setMessage({ type: 'error', text: json.error.message || 'Failed to load preferences' });
        } else {
          setPrefs({
            preferredThemes: json.preferredThemes ?? [],
            minPrizeAmount: json.minPrizeAmount ?? null,
            locationPreference: json.locationPreference ?? 'BOTH',
            maxParallelHackathons: json.maxParallelHackathons ?? 1,
          });
        }
      })
      .catch(() => {
        setMessage({ type: 'error', text: 'Failed to load preferences' });
      })
      .finally(() => setLoading(false));
  }, []);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (prefs.maxParallelHackathons < 1 || prefs.maxParallelHackathons > 10) {
      newErrors.maxParallelHackathons = 'Must be between 1 and 10';
    }

    if (prefs.minPrizeAmount !== null && prefs.minPrizeAmount < 0) {
      newErrors.minPrizeAmount = 'Must be a positive number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setMessage(null);
    setErrors({});

    if (!validateForm()) {
      setMessage({ type: 'error', text: 'Please fix validation errors' });
      return;
    }

    try {
      const response = await fetch('/api/team/preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(prefs),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.error?.fields) {
          setErrors(data.error.fields);
        }
        setMessage({ type: 'error', text: data.error?.message || 'Failed to save preferences' });
      } else {
        setMessage({ type: 'success', text: 'Preferences saved successfully' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    }
  };

  if (loading) {
    return <p className="text-sm text-slate-400">Loading preferences…</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="text-sm text-slate-300">Preferred themes</label>
        <input
          className={`mt-1 w-full rounded-lg border ${errors.preferredThemes ? 'border-red-500' : 'border-slate-700'} bg-slate-900/60 px-3 py-2 text-white`}
          value={prefs.preferredThemes.join(', ')}
          onChange={(event) =>
            setPrefs({ ...prefs, preferredThemes: event.target.value.split(',').map((item) => item.trim()).filter(Boolean) })
          }
          placeholder="AI, Climate, Health"
        />
        {errors.preferredThemes && <p className="mt-1 text-xs text-red-400">{errors.preferredThemes}</p>}
      </div>
      <div>
        <label className="text-sm text-slate-300">Minimum prize amount</label>
        <input
          type="number"
          min={0}
          className={`mt-1 w-full rounded-lg border ${errors.minPrizeAmount ? 'border-red-500' : 'border-slate-700'} bg-slate-900/60 px-3 py-2 text-white`}
          value={prefs.minPrizeAmount ?? ''}
          onChange={(event) => setPrefs({ ...prefs, minPrizeAmount: event.target.value ? Number(event.target.value) : null })}
          placeholder="e.g. 10000"
        />
        {errors.minPrizeAmount && <p className="mt-1 text-xs text-red-400">{errors.minPrizeAmount}</p>}
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
        <label className="text-sm text-slate-300">Max parallel hackathons (1-10)</label>
        <input
          type="number"
          min={1}
          max={10}
          className={`mt-1 w-full rounded-lg border ${errors.maxParallelHackathons ? 'border-red-500' : 'border-slate-700'} bg-slate-900/60 px-3 py-2 text-white`}
          value={prefs.maxParallelHackathons}
          onChange={(event) => setPrefs({ ...prefs, maxParallelHackathons: Number(event.target.value) })}
        />
        {errors.maxParallelHackathons && <p className="mt-1 text-xs text-red-400">{errors.maxParallelHackathons}</p>}
      </div>
      {message && (
        <p className={`text-sm ${message.type === 'success' ? 'text-emerald-300' : 'text-red-400'}`}>
          {message.text}
        </p>
      )}
      <button type="submit" className="rounded-lg bg-emerald-500 px-4 py-2 font-semibold text-emerald-950 hover:bg-emerald-600 transition-colors">
        Save preferences
      </button>
    </form>
  );
}
