import { useStore } from "@nanostores/preact";
import { useState, useRef } from "preact/hooks";
import {
  $state,
  addPage,
  deletePage,
  setActivePage,
  exportBackup,
  importBackup,
} from "../store";

export default function Sidebar() {
  const state = useStore($state);
  const [newPageName, setNewPageName] = useState("");
  const [adding, setAdding] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  const handleAddPage = () => {
    const name = newPageName.trim();
    if (!name) return;
    addPage(name);
    setNewPageName("");
    setAdding(false);
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Enter") handleAddPage();
    if (e.key === "Escape") setAdding(false);
  };

  const handleExport = () => {
    const blob = new Blob([exportBackup()], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `todo-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    fileInput.current?.click();
  };

  const handleFileChange = (e: Event) => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const ok = importBackup(reader.result as string);
      if (!ok) alert("Invalid backup file");
    };
    reader.readAsText(file);
  };

  return (
    <aside class="sidebar">
      <div class="sidebar-header">
        <span class="material-symbols-outlined sidebar-logo">checklist</span>
        <h1 class="sidebar-title">Todo</h1>
      </div>

      <nav class="sidebar-nav">
        {state.pages.map((page) => (
          <button
            key={page.id}
            class={`nav-item ${page.id === state.activePageId ? "active" : ""}`}
            onClick={() => setActivePage(page.id)}
          >
            <span class="material-symbols-outlined nav-icon">description</span>
            <span class="nav-label">{page.name}</span>
            <button
              class="nav-delete"
              onClick={(e) => {
                e.stopPropagation();
                deletePage(page.id);
              }}
              aria-label="Delete page"
            >
              <span class="material-symbols-outlined">close</span>
            </button>
          </button>
        ))}
      </nav>

      {adding ? (
        <div class="add-page-input">
          <input
            type="text"
            placeholder="Page name..."
            value={newPageName}
            onInput={(e) =>
              setNewPageName((e.target as HTMLInputElement).value)
            }
            onKeyDown={handleKeyDown}
            autoFocus
          />
          <button class="icon-btn" onClick={handleAddPage}>
            <span class="material-symbols-outlined">check</span>
          </button>
          <button class="icon-btn" onClick={() => setAdding(false)}>
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>
      ) : (
        <button class="add-page-btn" onClick={() => setAdding(true)}>
          <span class="material-symbols-outlined">add</span>
          <span>New Page</span>
        </button>
      )}

      <div class="sidebar-actions">
        <button class="action-btn" onClick={handleExport}>
          <span class="material-symbols-outlined">download</span>
          <span>Backup</span>
        </button>
        <button class="action-btn" onClick={handleImport}>
          <span class="material-symbols-outlined">upload</span>
          <span>Restore</span>
        </button>
        <input
          ref={fileInput}
          type="file"
          accept=".json"
          style={{ display: "none" }}
          onChange={handleFileChange}
        />
      </div>
    </aside>
  );
}
