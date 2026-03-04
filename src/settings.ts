import { atom } from "nanostores";

export type ThemeVariant = "md2" | "md3";
export type ColorMode = "light" | "dark" | "auto";

export interface Settings {
  theme: ThemeVariant;
  baseColor: string;
  colorMode: ColorMode;
  locale: "ja" | "en";
}

const SETTINGS_KEY = "todo-settings";

const defaultSettings: Settings = {
  theme: "md3",
  baseColor: "#6750a4",
  colorMode: "auto",
  locale: navigator.language.startsWith("ja") ? "ja" : "en",
};

function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) return { ...defaultSettings, ...JSON.parse(raw) };
  } catch {}
  return { ...defaultSettings };
}

export const $settings = atom<Settings>(loadSettings());

$settings.listen((s) => {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
  applyTheme(s);
});

export function updateSettings(partial: Partial<Settings>) {
  $settings.set({ ...$settings.get(), ...partial });
}

function hslFromHex(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, l * 100];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
  else if (max === g) h = ((b - r) / d + 2) / 6;
  else h = ((r - g) / d + 4) / 6;
  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
}

function generatePalette(hex: string) {
  const [h, s] = hslFromHex(hex);
  return {
    primary: `hsl(${h}, ${s}%, 40%)`,
    onPrimary: `hsl(${h}, ${s}%, 100%)`,
    primaryContainer: `hsl(${h}, ${Math.min(s + 20, 100)}%, 90%)`,
    onPrimaryContainer: `hsl(${h}, ${s}%, 10%)`,
    secondary: `hsl(${(h + 15) % 360}, ${Math.max(s - 20, 10)}%, 44%)`,
    secondaryContainer: `hsl(${(h + 15) % 360}, ${Math.min(s + 10, 100)}%, 90%)`,
    tertiary: `hsl(${(h + 60) % 360}, ${Math.max(s - 10, 10)}%, 33%)`,
    tertiaryContainer: `hsl(${(h + 60) % 360}, ${Math.min(s + 20, 100)}%, 90%)`,
    surface: `hsl(${h}, ${Math.min(s, 20)}%, 99%)`,
    surfaceDim: `hsl(${h}, ${Math.min(s, 15)}%, 87%)`,
    surfaceContainer: `hsl(${h}, ${Math.min(s, 20)}%, 96%)`,
    surfaceContainerLow: `hsl(${h}, ${Math.min(s, 20)}%, 97%)`,
    surfaceContainerHigh: `hsl(${h}, ${Math.min(s, 20)}%, 93%)`,
    surfaceContainerHighest: `hsl(${h}, ${Math.min(s, 20)}%, 90%)`,
    onSurface: `hsl(${h}, ${Math.min(s, 10)}%, 12%)`,
    onSurfaceVariant: `hsl(${h}, ${Math.min(s, 15)}%, 30%)`,
    outline: `hsl(${h}, ${Math.min(s, 10)}%, 50%)`,
    outlineVariant: `hsl(${h}, ${Math.min(s, 15)}%, 80%)`,
    error: "hsl(0, 75%, 42%)",
  };
}

function generateDarkPalette(hex: string) {
  const [h, s] = hslFromHex(hex);
  return {
    primary: `hsl(${h}, ${Math.min(s + 10, 100)}%, 80%)`,
    onPrimary: `hsl(${h}, ${s}%, 20%)`,
    primaryContainer: `hsl(${h}, ${s}%, 30%)`,
    onPrimaryContainer: `hsl(${h}, ${Math.min(s + 20, 100)}%, 90%)`,
    secondary: `hsl(${(h + 15) % 360}, ${Math.max(s - 10, 10)}%, 80%)`,
    secondaryContainer: `hsl(${(h + 15) % 360}, ${Math.max(s - 10, 10)}%, 30%)`,
    tertiary: `hsl(${(h + 60) % 360}, ${Math.max(s - 10, 10)}%, 80%)`,
    tertiaryContainer: `hsl(${(h + 60) % 360}, ${Math.max(s - 10, 10)}%, 30%)`,
    surface: `hsl(${h}, ${Math.min(s, 10)}%, 10%)`,
    surfaceDim: `hsl(${h}, ${Math.min(s, 10)}%, 6%)`,
    surfaceContainer: `hsl(${h}, ${Math.min(s, 10)}%, 12%)`,
    surfaceContainerLow: `hsl(${h}, ${Math.min(s, 10)}%, 10%)`,
    surfaceContainerHigh: `hsl(${h}, ${Math.min(s, 10)}%, 17%)`,
    surfaceContainerHighest: `hsl(${h}, ${Math.min(s, 10)}%, 22%)`,
    onSurface: `hsl(${h}, ${Math.min(s, 15)}%, 90%)`,
    onSurfaceVariant: `hsl(${h}, ${Math.min(s, 15)}%, 80%)`,
    outline: `hsl(${h}, ${Math.min(s, 10)}%, 60%)`,
    outlineVariant: `hsl(${h}, ${Math.min(s, 15)}%, 30%)`,
    error: "hsl(0, 75%, 75%)",
  };
}

function isDarkPreferred(): boolean {
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

export function applyTheme(settings: Settings) {
  const dark =
    settings.colorMode === "dark" ||
    (settings.colorMode === "auto" && isDarkPreferred());

  const palette = dark
    ? generateDarkPalette(settings.baseColor)
    : generatePalette(settings.baseColor);

  const root = document.documentElement;
  root.style.setProperty("--md-primary", palette.primary);
  root.style.setProperty("--md-on-primary", palette.onPrimary);
  root.style.setProperty("--md-primary-container", palette.primaryContainer);
  root.style.setProperty(
    "--md-on-primary-container",
    palette.onPrimaryContainer,
  );
  root.style.setProperty("--md-secondary", palette.secondary);
  root.style.setProperty(
    "--md-secondary-container",
    palette.secondaryContainer,
  );
  root.style.setProperty("--md-tertiary", palette.tertiary);
  root.style.setProperty("--md-tertiary-container", palette.tertiaryContainer);
  root.style.setProperty("--md-surface", palette.surface);
  root.style.setProperty("--md-surface-dim", palette.surfaceDim);
  root.style.setProperty("--md-surface-container", palette.surfaceContainer);
  root.style.setProperty(
    "--md-surface-container-low",
    palette.surfaceContainerLow,
  );
  root.style.setProperty(
    "--md-surface-container-high",
    palette.surfaceContainerHigh,
  );
  root.style.setProperty(
    "--md-surface-container-highest",
    palette.surfaceContainerHighest,
  );
  root.style.setProperty("--md-on-surface", palette.onSurface);
  root.style.setProperty("--md-on-surface-variant", palette.onSurfaceVariant);
  root.style.setProperty("--md-outline", palette.outline);
  root.style.setProperty("--md-outline-variant", palette.outlineVariant);
  root.style.setProperty("--md-error", palette.error);

  const isMd2 = settings.theme === "md2";
  root.style.setProperty("--md-radius-sm", isMd2 ? "4px" : "8px");
  root.style.setProperty("--md-radius-md", isMd2 ? "4px" : "12px");
  root.style.setProperty("--md-radius-lg", isMd2 ? "8px" : "16px");
  root.style.setProperty("--md-radius-xl", isMd2 ? "16px" : "28px");

  root.setAttribute("data-theme", dark ? "dark" : "light");
  root.setAttribute("data-variant", settings.theme);
}

export function initTheme() {
  const settings = $settings.get();
  applyTheme(settings);

  if (settings.colorMode === "auto") {
    window
      .matchMedia("(prefers-color-scheme: dark)")
      .addEventListener("change", () => {
        applyTheme($settings.get());
      });
  }
}
