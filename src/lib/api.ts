// export const API_BASE = 'https://blunchqt-1.onrender.com';
// export const WS_BASE = 'wss://blunchqt-1.onrender.com';

export const API_BASE = 'http://localhost:8000';
export const WS_BASE = 'ws://localhost:8000';

// ── Types ──────────────────────────────────────────────

export interface TrackerTopic {
  id: number;
  topic: string;
  is_read: boolean;
  is_youtube: boolean;
  is_drills: boolean;
  date_started: string | null;
  date_finished: string | null;
  created_at?: string;
}

export interface TOSTopic {
  id: number;
  subject: string;
  main_topic: string;
  sub_topic: string | null;
  topic_number: string | null;
  topic: string;
  status: 'undone' | 'inprogress' | 'done';
  comment: string | null;
}

export interface DSM5Topic {
  id: number;
  sub_topic: string;
  topic: string;
  status: boolean;
  bgcolor: string;
}

export interface Score {
  id: number;
  drill: string;
  drill_date: string | null;
  score: number;
  mistakes: number;
  total: number;
  average: number;
}

export interface SubjectProgress {
  total: number;
  completed: number;
  remaining: number;
}

export type ProgressData = Record<string, SubjectProgress>;

export interface WSMessage<T = unknown> {
  type: 'initial' | 'update' | 'insert' | 'delete' | 'pong';
  data?: T;
  id?: number;
  field?: string;
  value?: unknown;
  table?: string;
}

// ── HTTP helpers ───────────────────────────────────────

async function post<T = unknown>(path: string, body: unknown): Promise<{ ok: boolean; data: T }> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  return { ok: res.ok, data };
}

async function get<T = unknown>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`);
  return res.json();
}

// ── Tracker topics ─────────────────────────────────────

export function fetchTrackerTopics(subject: string): Promise<TrackerTopic[]> {
  return get<TrackerTopic[]>(`/${subject}`);
}

export function updateTrackerTopic(payload: {
  id: number;
  subject: string;
  field: string;
  value: string | boolean;
}) {
  return post('/update_topic', payload);
}

// ── TOS topics ─────────────────────────────────────────

export function fetchTOSTopics(subject: string): Promise<TOSTopic[]> {
  return get<TOSTopic[]>(`/topics?subject=${encodeURIComponent(subject)}`);
}

export function updateTOSStatus(id: number, status: string) {
  return post('/update_topic_status', { id, status });
}

export function updateTOSComment(id: number, comment: string) {
  return post('/update_topic_comment', { id, comment });
}

// ── DSM-5 ──────────────────────────────────────────────

export function fetchDSM5Topics(): Promise<DSM5Topic[]> {
  return get<DSM5Topic[]>('/dsm5_disorders');
}

export function updateDSM5(id: number, field: string, value: boolean) {
  return post('/update_dsm5', { id, field, value });
}

// ── Scores ─────────────────────────────────────────────

export function fetchScores(endpoint: string): Promise<Score[]> {
  return get<Score[]>(`/${endpoint}`);
}

export function updateScore(payload: {
  id: number;
  table: string;
  field: string;
  value: string | number;
}) {
  return post('/update_score', payload);
}

export function addScore(payload: {
  table: string;
  drill: string;
  drill_date: string | null;
  score: number;
  mistakes: number;
  total: number;
}) {
  return post('/add_score', payload);
}

export function deleteScore(table: string, id: number) {
  return post('/delete_score', { table, id });
}

// ── Progress ──────────────────────────────────────────

export function fetchProgress(): Promise<ProgressData> {
  return get<ProgressData>('/progress');
}

// ── WebSocket ──────────────────────────────────────────

export function createWS(path: string): WebSocket {
  return new WebSocket(`${WS_BASE}${path}`);
}
