import { atom, computed } from "nanostores";

export interface Task {
  id: string;
  text: string;
  done: boolean;
  dueDate?: string;
  link?: string;
}

export interface Page {
  id: string;
  name: string;
  tasks: Task[];
}

export interface AppState {
  pages: Page[];
  activePageId: string | null;
}

const STORAGE_KEY = "todo-app-state";

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { pages: [], activePageId: null };
}

function saveState(state: AppState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export const $state = atom<AppState>(loadState());

$state.listen((state) => saveState(state));

export const $activePage = computed($state, (state) => {
  return state.pages.find((p) => p.id === state.activePageId) ?? null;
});

export function addPage(name: string) {
  const state = $state.get();
  const page: Page = { id: generateId(), name, tasks: [] };
  const next = { pages: [...state.pages, page], activePageId: page.id };
  $state.set(next);
}

export function deletePage(id: string) {
  const state = $state.get();
  const filtered = state.pages.filter((p) => p.id !== id);
  const activePageId =
    state.activePageId === id ? (filtered[0]?.id ?? null) : state.activePageId;
  $state.set({ pages: filtered, activePageId });
}

export function setActivePage(id: string) {
  const state = $state.get();
  $state.set({ ...state, activePageId: id });
}

export function addTask(text: string, dueDate?: string, link?: string) {
  const state = $state.get();
  if (!state.activePageId) return;
  const task: Task = {
    id: generateId(),
    text,
    done: false,
    dueDate: dueDate || undefined,
    link: link || undefined,
  };
  const pages = state.pages.map((p) =>
    p.id === state.activePageId ? { ...p, tasks: [...p.tasks, task] } : p,
  );
  $state.set({ ...state, pages });
}

export function toggleTask(taskId: string) {
  const state = $state.get();
  const pages = state.pages.map((p) =>
    p.id === state.activePageId
      ? {
          ...p,
          tasks: p.tasks.map((t) =>
            t.id === taskId ? { ...t, done: !t.done } : t,
          ),
        }
      : p,
  );
  $state.set({ ...state, pages });
}

export function deleteTask(taskId: string) {
  const state = $state.get();
  const pages = state.pages.map((p) =>
    p.id === state.activePageId
      ? { ...p, tasks: p.tasks.filter((t) => t.id !== taskId) }
      : p,
  );
  $state.set({ ...state, pages });
}

export function updateTask(
  taskId: string,
  updates: Partial<Pick<Task, "text" | "dueDate" | "link">>,
) {
  const state = $state.get();
  const pages = state.pages.map((p) =>
    p.id === state.activePageId
      ? {
          ...p,
          tasks: p.tasks.map((t) =>
            t.id === taskId ? { ...t, ...updates } : t,
          ),
        }
      : p,
  );
  $state.set({ ...state, pages });
}

export function renamePage(id: string, name: string) {
  const state = $state.get();
  const pages = state.pages.map((p) => (p.id === id ? { ...p, name } : p));
  $state.set({ ...state, pages });
}

export function exportBackup(): string {
  return JSON.stringify($state.get(), null, 2);
}

export function importBackup(json: string): boolean {
  try {
    const data = JSON.parse(json) as AppState;
    if (!Array.isArray(data.pages)) return false;
    $state.set(data);
    return true;
  } catch {
    return false;
  }
}
