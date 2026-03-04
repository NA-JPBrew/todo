import { atom, computed } from "nanostores";

export type Locale = "ja" | "en";

const translations: Record<Locale, Record<string, string>> = {
  en: {
    "app.title": "Todo",
    "sidebar.newPage": "New Page",
    "sidebar.backup": "Backup",
    "sidebar.restore": "Restore",
    "sidebar.settings": "Settings",
    "page.placeholder": "Page name...",
    "task.add": "New Task",
    "task.placeholder": "What needs to be done?",
    "task.cancel": "Cancel",
    "task.submit": "Add",
    "task.remaining": "{n} remaining",
    "task.completed": "Completed ({n})",
    "task.dueDate": "Due date",
    "task.link": "Link (URL)",
    "task.overdue": "Overdue",
    "empty.noPages": "No pages yet",
    "empty.noPagesDesc": "Create a page from the sidebar to get started",
    "empty.selectPage": "Select a page",
    "empty.selectPageDesc": "Pick a page from the sidebar",
    "empty.noTasks": "No tasks",
    "empty.noTasksDesc": "Tap + to add your first task",
    "settings.title": "Settings",
    "settings.theme": "Theme",
    "settings.md2": "Material Design 2",
    "settings.md3": "Material Design 3",
    "settings.baseColor": "Base Color",
    "settings.colorMode": "Appearance",
    "settings.light": "Light",
    "settings.dark": "Dark",
    "settings.auto": "Auto",
    "settings.language": "Language",
    "settings.close": "Close",
    "backup.invalid": "Invalid backup file",
    "notification.title": "Task Due",
    "notification.body": '"{task}" is due now',
    "notification.permission":
      "Enable notifications to get reminders for due tasks",
  },
  ja: {
    "app.title": "Todo",
    "sidebar.newPage": "新しいページ",
    "sidebar.backup": "バックアップ",
    "sidebar.restore": "復元",
    "sidebar.settings": "設定",
    "page.placeholder": "ページ名...",
    "task.add": "新しいタスク",
    "task.placeholder": "やることを入力...",
    "task.cancel": "キャンセル",
    "task.submit": "追加",
    "task.remaining": "残り {n} 件",
    "task.completed": "完了 ({n})",
    "task.dueDate": "期限",
    "task.link": "リンク (URL)",
    "task.overdue": "期限切れ",
    "empty.noPages": "ページがありません",
    "empty.noPagesDesc": "サイドバーからページを作成してください",
    "empty.selectPage": "ページを選択",
    "empty.selectPageDesc": "サイドバーからページを選んでください",
    "empty.noTasks": "タスクがありません",
    "empty.noTasksDesc": "＋ボタンで最初のタスクを追加しましょう",
    "settings.title": "設定",
    "settings.theme": "テーマ",
    "settings.md2": "Material Design 2",
    "settings.md3": "Material Design 3",
    "settings.baseColor": "ベースカラー",
    "settings.colorMode": "外観",
    "settings.light": "ライト",
    "settings.dark": "ダーク",
    "settings.auto": "自動",
    "settings.language": "言語",
    "settings.close": "閉じる",
    "backup.invalid": "無効なバックアップファイルです",
    "notification.title": "タスクの期限",
    "notification.body": "「{task}」の期限です",
    "notification.permission":
      "通知を有効にすると、期限のリマインダーを受け取れます",
  },
};

function detectLocale(): Locale {
  const lang = navigator.language.slice(0, 2);
  return lang === "ja" ? "ja" : "en";
}

export const $locale = atom<Locale>(detectLocale());

export function setLocale(locale: Locale) {
  $locale.set(locale);
}

export function t(
  key: string,
  params?: Record<string, string | number>,
): string {
  const locale = $locale.get();
  let text = translations[locale][key] ?? translations["en"][key] ?? key;
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      text = text.replace(`{${k}}`, String(v));
    }
  }
  return text;
}

export const $t = computed($locale, () => t);
