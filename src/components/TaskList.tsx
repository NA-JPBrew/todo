import { useStore } from "@nanostores/preact";
import { useState } from "preact/hooks";
import { $activePage, $state, addTask, toggleTask, deleteTask } from "../store";

export default function TaskList() {
  const page = useStore($activePage);
  const state = useStore($state);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [taskText, setTaskText] = useState("");

  if (state.pages.length === 0) {
    return (
      <main class="main-content">
        <div class="empty-state">
          <span class="material-symbols-outlined empty-icon">note_stack</span>
          <p class="empty-title">No pages yet</p>
          <p class="empty-sub">Create a page from the sidebar to get started</p>
        </div>
      </main>
    );
  }

  if (!page) {
    return (
      <main class="main-content">
        <div class="empty-state">
          <span class="material-symbols-outlined empty-icon">touch_app</span>
          <p class="empty-title">Select a page</p>
          <p class="empty-sub">Pick a page from the sidebar</p>
        </div>
      </main>
    );
  }

  const handleAdd = () => {
    const text = taskText.trim();
    if (!text) return;
    addTask(text);
    setTaskText("");
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
        <h2 class="page-title">{page.name}</h2>
        <span class="task-count">{pending.length} remaining</span>
      </header>

      {page.tasks.length === 0 ? (
        <div class="empty-state small">
          <span class="material-symbols-outlined empty-icon">add_task</span>
          <p class="empty-title">No tasks</p>
          <p class="empty-sub">Tap + to add your first task</p>
        </div>
      ) : (
        <div class="task-sections">
          {pending.length > 0 && (
            <section class="task-section">
              {pending.map((task) => (
                <div key={task.id} class="task-item">
                  <button
                    class="task-check"
                    onClick={() => toggleTask(task.id)}
                    aria-label="Toggle task"
                  >
                    <span class="material-symbols-outlined">circle</span>
                  </button>
                  <span class="task-text">{task.text}</span>
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
              <p class="section-label">Completed ({completed.length})</p>
              {completed.map((task) => (
                <div key={task.id} class="task-item done">
                  <button
                    class="task-check checked"
                    onClick={() => toggleTask(task.id)}
                    aria-label="Toggle task"
                  >
                    <span class="material-symbols-outlined">check_circle</span>
                  </button>
                  <span class="task-text">{task.text}</span>
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
        aria-label="Add task"
      >
        <span class="material-symbols-outlined">add</span>
      </button>

      {dialogOpen && (
        <div class="dialog-overlay" onClick={() => setDialogOpen(false)}>
          <div class="dialog" onClick={(e) => e.stopPropagation()}>
            <h3 class="dialog-title">New Task</h3>
            <input
              class="dialog-input"
              type="text"
              placeholder="What needs to be done?"
              value={taskText}
              onInput={(e) => setTaskText((e.target as HTMLInputElement).value)}
              onKeyDown={handleKeyDown}
              autoFocus
            />
            <div class="dialog-actions">
              <button class="dialog-btn" onClick={() => setDialogOpen(false)}>
                Cancel
              </button>
              <button class="dialog-btn primary" onClick={handleAdd}>
                Add
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
