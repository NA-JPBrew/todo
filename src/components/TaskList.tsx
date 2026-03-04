import { useStore } from "@nanostores/preact";
import { useState } from "preact/hooks";
import { $activePage, $state, addTask, toggleTask, deleteTask } from "../store";
import { $locale, t } from "../i18n";

interface Props {
  onMenuOpen: () => void;
}

function isOverdue(dueDate?: string): boolean {
  if (!dueDate) return false;
  return new Date(dueDate) < new Date();
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  const now = new Date();
  const diff = d.getTime() - now.getTime();
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

  if (days === 0) return "Today";
  if (days === 1) return "Tomorrow";
  if (days === -1) return "Yesterday";
  if (days < -1) return `${Math.abs(days)} days ago`;
  if (days <= 7) return `In ${days} days`;

  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export default function TaskList({ onMenuOpen }: Props) {
  const page = useStore($activePage);
  const state = useStore($state);
  useStore($locale);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [taskText, setTaskText] = useState("");
  const [taskDate, setTaskDate] = useState("");
  const [taskLink, setTaskLink] = useState("");

  if (state.pages.length === 0) {
    return (
      <main class="main-content">
        <header class="content-header">
          <button class="menu-toggle" onClick={onMenuOpen}>
            <span class="material-symbols-outlined">menu</span>
          </button>
        </header>
        <div class="empty-state">
          <span class="material-symbols-outlined empty-icon">note_stack</span>
          <p class="empty-title">{t("empty.noPages")}</p>
          <p class="empty-sub">{t("empty.noPagesDesc")}</p>
        </div>
      </main>
    );
  }

  if (!page) {
    return (
      <main class="main-content">
        <header class="content-header">
          <button class="menu-toggle" onClick={onMenuOpen}>
            <span class="material-symbols-outlined">menu</span>
          </button>
        </header>
        <div class="empty-state">
          <span class="material-symbols-outlined empty-icon">touch_app</span>
          <p class="empty-title">{t("empty.selectPage")}</p>
          <p class="empty-sub">{t("empty.selectPageDesc")}</p>
        </div>
      </main>
    );
  }

  const handleAdd = () => {
    const text = taskText.trim();
    if (!text) return;
    addTask(text, taskDate || undefined, taskLink || undefined);
    setTaskText("");
    setTaskDate("");
    setTaskLink("");
    setDialogOpen(false);
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Enter") handleAdd();
    if (e.key === "Escape") setDialogOpen(false);
  };

  const pending = page.tasks.filter((t) => !t.done);
  const completed = page.tasks.filter((t) => t.done);

  return (
    <main class="main-content">
      <header class="content-header">
        <button class="menu-toggle" onClick={onMenuOpen}>
          <span class="material-symbols-outlined">menu</span>
        </button>
        <h2 class="page-title">{page.name}</h2>
        <span class="task-count">
          {t("task.remaining", { n: pending.length })}
        </span>
      </header>

      {page.tasks.length === 0 ? (
        <div class="empty-state small">
          <span class="material-symbols-outlined empty-icon">add_task</span>
          <p class="empty-title">{t("empty.noTasks")}</p>
          <p class="empty-sub">{t("empty.noTasksDesc")}</p>
        </div>
      ) : (
        <div class="task-sections">
          {pending.length > 0 && (
            <section class="task-section">
              {pending.map((task) => (
                <div
                  key={task.id}
                  class={`task-item ${isOverdue(task.dueDate) ? "overdue" : ""}`}
                >
                  <button
                    class="task-check"
                    onClick={() => toggleTask(task.id)}
                    aria-label="Toggle task"
                  >
                    <span class="material-symbols-outlined">circle</span>
                  </button>
                  <div class="task-body">
                    <span class="task-text">{task.text}</span>
                    <div class="task-meta">
                      {task.dueDate && (
                        <span
                          class={`task-badge ${isOverdue(task.dueDate) ? "overdue" : ""}`}
                        >
                          <span class="material-symbols-outlined badge-icon">
                            schedule
                          </span>
                          {formatDate(task.dueDate)}
                        </span>
                      )}
                      {task.link && (
                        <a
                          class="task-badge link"
                          href={task.link}
                          target="_blank"
                          rel="noopener"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <span class="material-symbols-outlined badge-icon">
                            link
                          </span>
                          {new URL(task.link).hostname}
                        </a>
                      )}
                    </div>
                  </div>
                  <button
                    class="task-delete"
                    onClick={() => deleteTask(task.id)}
                    aria-label="Delete task"
                  >
                    <span class="material-symbols-outlined">delete</span>
                  </button>
                </div>
              ))}
            </section>
          )}
          {completed.length > 0 && (
            <section class="task-section">
              <p class="section-label">
                {t("task.completed", { n: completed.length })}
              </p>
              {completed.map((task) => (
                <div key={task.id} class="task-item done">
                  <button
                    class="task-check checked"
                    onClick={() => toggleTask(task.id)}
                    aria-label="Toggle task"
                  >
                    <span class="material-symbols-outlined">check_circle</span>
                  </button>
                  <div class="task-body">
                    <span class="task-text">{task.text}</span>
                  </div>
                  <button
                    class="task-delete"
                    onClick={() => deleteTask(task.id)}
                    aria-label="Delete task"
                  >
                    <span class="material-symbols-outlined">delete</span>
                  </button>
                </div>
              ))}
            </section>
          )}
        </div>
      )}

      <button
        class="fab"
        onClick={() => setDialogOpen(true)}
        aria-label={t("task.add")}
      >
        <span class="material-symbols-outlined">add</span>
      </button>

      {dialogOpen && (
        <div class="dialog-overlay" onClick={() => setDialogOpen(false)}>
          <div class="dialog" onClick={(e) => e.stopPropagation()}>
            <h3 class="dialog-title">{t("task.add")}</h3>
            <input
              class="dialog-input"
              type="text"
              placeholder={t("task.placeholder")}
              value={taskText}
              onInput={(e) => setTaskText((e.target as HTMLInputElement).value)}
              onKeyDown={handleKeyDown}
              autoFocus
            />
            <div class="dialog-field">
              <label class="dialog-field-label">
                <span class="material-symbols-outlined field-icon">
                  schedule
                </span>
                {t("task.dueDate")}
              </label>
              <input
                class="dialog-input small"
                type="datetime-local"
                value={taskDate}
                onInput={(e) =>
                  setTaskDate((e.target as HTMLInputElement).value)
                }
              />
            </div>
            <div class="dialog-field">
              <label class="dialog-field-label">
                <span class="material-symbols-outlined field-icon">link</span>
                {t("task.link")}
              </label>
              <input
                class="dialog-input small"
                type="url"
                placeholder="https://..."
                value={taskLink}
                onInput={(e) =>
                  setTaskLink((e.target as HTMLInputElement).value)
                }
              />
            </div>
            <div class="dialog-actions">
              <button class="dialog-btn" onClick={() => setDialogOpen(false)}>
                {t("task.cancel")}
              </button>
              <button class="dialog-btn primary" onClick={handleAdd}>
                {t("task.submit")}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
