import { $state } from "./store";

let notifiedTasks = new Set<string>();
let checkInterval: ReturnType<typeof setInterval> | null = null;

export async function requestNotificationPermission(): Promise<boolean> {
  if (!("Notification" in window)) return false;
  if (Notification.permission === "granted") return true;
  if (Notification.permission === "denied") return false;
  const result = await Notification.requestPermission();
  return result === "granted";
}

function checkDueTasks() {
  if (Notification.permission !== "granted") return;

  const now = new Date();
  const state = $state.get();

  for (const page of state.pages) {
    for (const task of page.tasks) {
      if (task.done || !task.dueDate || notifiedTasks.has(task.id)) continue;

      const due = new Date(task.dueDate);
      if (due <= now) {
        new Notification("Task Due", {
          body: `"${task.text}" is due now`,
          icon: "/icon-192.png",
          tag: task.id,
        });
        notifiedTasks.add(task.id);
      }
    }
  }
}

export function startNotificationChecker() {
  if (checkInterval) return;
  checkDueTasks();
  checkInterval = setInterval(checkDueTasks, 60_000);
}

export function stopNotificationChecker() {
  if (checkInterval) {
    clearInterval(checkInterval);
    checkInterval = null;
  }
}
