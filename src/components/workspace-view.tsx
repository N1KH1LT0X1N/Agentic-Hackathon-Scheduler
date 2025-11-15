'use client';

import { FormEvent, useEffect, useState } from 'react';
import { formatDate } from '@/lib/utils';

interface TeamHackathonDetail {
  id: string;
  status: string;
  priorityScore: number;
  hackathon: {
    title: string;
    platform: { name: string };
    startDate?: string;
    endDate?: string;
  };
  requirements: { id: string; rawText: string; checklistJson: ChecklistItem[] }[];
}

interface Task {
  id: string;
  title: string;
  status: string;
  dueAt?: string;
  category: string;
}

interface ProjectFormState {
  name: string;
  shortDescription: string;
  techStack: string[];
  githubRepoUrl?: string | null;
  demoUrl?: string | null;
  pitchDeckUrl?: string | null;
  coverImageUrl?: string | null;
}

interface ChecklistItem {
  label: string;
  type: string;
  completed?: boolean;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

const statusOptions = ['TODO', 'IN_PROGRESS', 'BLOCKED', 'DONE'];

export function WorkspaceView({ teamHackathonId }: { teamHackathonId: string }) {
  const [detail, setDetail] = useState<TeamHackathonDetail | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [project, setProject] = useState<ProjectFormState>({ name: '', shortDescription: '', techStack: [] });
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [rawText, setRawText] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [submissionStatus, setSubmissionStatus] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const loadWorkspace = async () => {
    setLoading(true);
    const detailRes = await fetch(`/api/team-hackathons/${teamHackathonId}`).then((res) => res.json());
    const taskRes = await fetch(`/api/team-hackathons/${teamHackathonId}/tasks`).then((res) => res.json());
    const projectRes = await fetch(`/api/team-hackathons/${teamHackathonId}/project`).then((res) => res.json());
    const submission = await fetch(`/api/team-hackathons/${teamHackathonId}/submission-status`).then((res) => res.json());

    setDetail(detailRes);
    setTasks(taskRes);
    setProject(
      projectRes ?? {
        name: '',
        shortDescription: '',
        techStack: [],
        githubRepoUrl: '',
        demoUrl: '',
        pitchDeckUrl: '',
        coverImageUrl: '',
      },
    );
    const latestRequirement = detailRes.requirements?.[0];
    setChecklist(latestRequirement?.checklistJson ?? []);
    setRawText(latestRequirement?.rawText ?? '');
    setSubmissionStatus(submission.missing ?? []);
    setLoading(false);
  };

  useEffect(() => {
    loadWorkspace();
  }, [teamHackathonId]);

  const updateTaskStatus = async (taskId: string, status: string) => {
    await fetch(`/api/tasks/${taskId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    loadWorkspace();
  };

  const handleProjectSubmit = async (event: FormEvent) => {
    event.preventDefault();
    await fetch(`/api/team-hackathons/${teamHackathonId}/project`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(project),
    });
    loadWorkspace();
  };

  const handleChecklistToggle = async (index: number) => {
    const updated = checklist.map((item, idx) => (idx === index ? { ...item, completed: !item.completed } : item));
    setChecklist(updated);
    await fetch(`/api/team-hackathons/${teamHackathonId}/requirements`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ checklist: updated }),
    });
  };

  const handleParseRequirements = async () => {
    await fetch(`/api/team-hackathons/${teamHackathonId}/requirements/parse`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rawText }),
    });
    loadWorkspace();
  };

  const sendChatMessage = async () => {
    if (!chatInput.trim()) return;
    const newMessages = [...chatMessages, { role: 'user', content: chatInput } as ChatMessage];
    setChatMessages(newMessages);
    setChatInput('');
    const response = await fetch(`/api/ai/hackathon-chat/${teamHackathonId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: newMessages }),
    }).then((res) => res.json());
    setChatMessages([...newMessages, { role: 'assistant', content: response.reply }]);
  };

  if (loading || !detail) {
    return <p className="text-sm text-slate-400">Loading workspace…</p>;
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-widest text-emerald-300">Workspace</p>
            <h2 className="text-3xl font-semibold text-white">{detail.hackathon.title}</h2>
            <p className="text-sm text-slate-400">{detail.hackathon.platform?.name}</p>
            <p className="text-sm text-slate-400">
              {formatDate(detail.hackathon.startDate ?? null)} → {formatDate(detail.hackathon.endDate ?? null)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-slate-400">Priority score</p>
            <p className="text-2xl font-semibold text-emerald-300">{detail.priorityScore.toFixed(2)}</p>
          </div>
        </div>
        {submissionStatus.length > 0 && (
          <p className="mt-4 text-sm text-amber-300">Missing submission items: {submissionStatus.join(', ')}</p>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-white">Tasks</h3>
              <button
                onClick={() => fetch(`/api/team-hackathons/${detail.id}/generate-plan`, { method: 'POST' }).then(loadWorkspace)}
                className="rounded-lg border border-emerald-500 px-3 py-1 text-xs text-emerald-300"
              >
                Generate plan
              </button>
            </div>
            <ul className="mt-4 space-y-3">
              {tasks.map((task) => (
                <li key={task.id} className="rounded-lg border border-slate-800 bg-slate-950/40 p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-white">{task.title}</p>
                      <p className="text-xs text-slate-400">Due {formatDate(task.dueAt ?? null)}</p>
                    </div>
                    <select
                      className="rounded-lg border border-slate-700 bg-slate-900/60 px-2 py-1 text-xs"
                      value={task.status}
                      onChange={(event) => updateTaskStatus(task.id, event.target.value)}
                    >
                      {statusOptions.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </div>
                </li>
              ))}
              {tasks.length === 0 && <p className="text-sm text-slate-400">No tasks yet. Generate a plan to begin.</p>}
            </ul>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
            <h3 className="text-xl font-semibold text-white">Project details</h3>
            <form className="mt-4 space-y-4" onSubmit={handleProjectSubmit}>
              <div>
                <label className="text-sm text-slate-300">Name</label>
                <input
                  className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white"
                  value={project.name}
                  onChange={(event) => setProject({ ...project, name: event.target.value })}
                />
              </div>
              <div>
                <label className="text-sm text-slate-300">Short description</label>
                <textarea
                  className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white"
                  value={project.shortDescription}
                  onChange={(event) => setProject({ ...project, shortDescription: event.target.value })}
                />
              </div>
              <div>
                <label className="text-sm text-slate-300">Tech stack</label>
                <input
                  className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white"
                  value={project.techStack?.join(', ') ?? ''}
                  onChange={(event) =>
                    setProject({ ...project, techStack: event.target.value.split(',').map((item) => item.trim()).filter(Boolean) })
                  }
                />
              </div>
              {['githubRepoUrl', 'demoUrl', 'pitchDeckUrl', 'coverImageUrl'].map((field) => (
                <div key={field}>
                  <label className="text-sm text-slate-300 capitalize">{field.replace('Url', ' URL')}</label>
                  <input
                    className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white"
                    value={(project as any)[field] ?? ''}
                    onChange={(event) => setProject({ ...project, [field]: event.target.value })}
                  />
                </div>
              ))}
              <button type="submit" className="rounded-lg bg-emerald-500 px-4 py-2 font-semibold text-emerald-950">
                Save project
              </button>
            </form>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
            <h3 className="text-xl font-semibold text-white">Submission checklist</h3>
            <textarea
              className="mt-3 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white"
              rows={4}
              placeholder="Paste requirements text here"
              value={rawText}
              onChange={(event) => setRawText(event.target.value)}
            />
            <button
              onClick={handleParseRequirements}
              className="mt-2 rounded-lg border border-emerald-500 px-3 py-1 text-xs text-emerald-300"
            >
              Generate checklist
            </button>
            <ul className="mt-4 space-y-2">
              {checklist.map((item, index) => (
                <li key={item.label} className="flex items-center gap-2 text-sm text-slate-200">
                  <input
                    type="checkbox"
                    checked={Boolean(item.completed)}
                    onChange={() => handleChecklistToggle(index)}
                  />
                  <span>{item.label}</span>
                </li>
              ))}
              {checklist.length === 0 && <p className="text-sm text-slate-400">No checklist yet.</p>}
            </ul>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
            <h3 className="text-xl font-semibold text-white">AI copilot</h3>
            <div className="mt-3 h-64 space-y-2 overflow-y-auto rounded-lg border border-slate-800 bg-slate-950/40 p-3 text-sm">
              {chatMessages.map((message, index) => (
                <div key={index} className={message.role === 'assistant' ? 'text-emerald-200' : 'text-slate-200'}>
                  <p className="text-xs uppercase tracking-widest">{message.role}</p>
                  <p>{message.content}</p>
                </div>
              ))}
              {chatMessages.length === 0 && <p className="text-slate-400">Ask about scope, plan, or blockers.</p>}
            </div>
            <div className="mt-3 flex gap-2">
              <input
                className="flex-1 rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white"
                value={chatInput}
                onChange={(event) => setChatInput(event.target.value)}
                placeholder="Ask the copilot…"
              />
              <button onClick={sendChatMessage} className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-emerald-950">
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
