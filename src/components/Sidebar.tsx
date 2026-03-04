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
import { $locale, t } from "../i18n";

interface Props {
  open: boolean;
  onClose: () => void;
  onOpenSettings: () => void;
}

export default function Sidebar({ open, onClose, onOpenSettings }: Props) {
  const state = useStore($state);
  useStore($locale);
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
      if (!ok) alert(t("backup.invalid"));
    };
    reader.readAsText(file);
  };

  const handlePageClick = (pageId: string) => {
    setActivePage(pageId);
    onClose();
  };

  return (
    <>
      {open && <div class="sidebar-backdrop" onClick={onClose} />}
      <aside class={`sidebar ${open ? "open" : ""}`}>
        <div class="sidebar-header">
          <span class="material-symbols-outlined sidebar-logo">checklist</span>
          <h1 class="sidebar-title">{t("app.title")}</h1>
        </div>

        <nav class="sidebar-nav">
          {state.pages.map((page) => (
            <button
              key={page.id}
              class={`nav-item ${page.id === state.activePageId ? "active" : ""}`}
              onClick={() => handlePageClick(page.id)}
            >
              <span class="material-symbols-outlined nav-icon">
                description
              </span>
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
              placeholder={t("page.placeholder")}
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
            <span>{t("sidebar.newPage")}</span>
          </button>
        )}

        <div class="sidebar-actions">
          <button class="action-btn" onClick={handleExport}>
            <span class="material-symbols-outlined">download</span>
            <span>{t("sidebar.backup")}</span>
          </button>
          <button class="action-btn" onClick={handleImport}>
            <span class="material-symbols-outlined">upload</span>
            <span>{t("sidebar.restore")}</span>
          </button>
          <input
            ref={fileInput}
            type="file"
            accept=".json"
            style={{ display: "none" }}
            onChange={handleFileChange}
          />
        </div>

        <button class="action-btn settings-btn" onClick={onOpenSettings}>
          <span class="material-symbols-outlined">settings</span>
          <span>{t("sidebar.settings")}</span>
        </button>
      </aside>
    </>
  );
}
