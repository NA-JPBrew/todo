import { useStore } from "@nanostores/preact";
import { useState } from "preact/hooks";
import {
  $settings,
  updateSettings,
  type ThemeVariant,
  type ColorMode,
} from "../settings";
import { $locale, setLocale, t, type Locale } from "../i18n";

const COLOR_PRESETS = [
  "#6750a4",
  "#0b57d0",
  "#006a6a",
  "#386a20",
  "#984061",
  "#904d00",
  "#ba1a1a",
  "#5b5f71",
];

export default function SettingsPanel({ onClose }: { onClose: () => void }) {
  const settings = useStore($settings);
  useStore($locale);
  const [customColor, setCustomColor] = useState(settings.baseColor);

  const handleTheme = (theme: ThemeVariant) => updateSettings({ theme });

  const handleColorMode = (colorMode: ColorMode) =>
    updateSettings({ colorMode });

  const handleBaseColor = (color: string) => {
    setCustomColor(color);
    updateSettings({ baseColor: color });
  };

  const handleLocale = (locale: Locale) => {
    setLocale(locale);
    updateSettings({ locale });
  };

  return (
    <div class="dialog-overlay" onClick={onClose}>
      <div class="settings-panel" onClick={(e) => e.stopPropagation()}>
        <div class="settings-header">
          <h3 class="dialog-title">{t("settings.title")}</h3>
          <button class="icon-btn" onClick={onClose}>
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>

        <div class="settings-body">
          <section class="settings-section">
            <label class="settings-label">{t("settings.theme")}</label>
            <div class="settings-chips">
              <button
                class={`chip ${settings.theme === "md2" ? "selected" : ""}`}
                onClick={() => handleTheme("md2")}
              >
                {t("settings.md2")}
              </button>
              <button
                class={`chip ${settings.theme === "md3" ? "selected" : ""}`}
                onClick={() => handleTheme("md3")}
              >
                {t("settings.md3")}
              </button>
            </div>
          </section>

          <section class="settings-section">
            <label class="settings-label">{t("settings.baseColor")}</label>
            <div class="color-grid">
              {COLOR_PRESETS.map((color) => (
                <button
                  key={color}
                  class={`color-swatch ${settings.baseColor === color ? "selected" : ""}`}
                  style={{ background: color }}
                  onClick={() => handleBaseColor(color)}
                  aria-label={color}
                />
              ))}
              <label
                class="color-swatch custom"
                style={{ background: customColor }}
              >
                <input
                  type="color"
                  value={customColor}
                  onInput={(e) =>
                    handleBaseColor((e.target as HTMLInputElement).value)
                  }
                />
                <span class="material-symbols-outlined color-custom-icon">
                  colorize
                </span>
              </label>
            </div>
          </section>

          <section class="settings-section">
            <label class="settings-label">{t("settings.colorMode")}</label>
            <div class="settings-chips">
              <button
                class={`chip ${settings.colorMode === "light" ? "selected" : ""}`}
                onClick={() => handleColorMode("light")}
              >
                <span class="material-symbols-outlined chip-icon">
                  light_mode
                </span>
                {t("settings.light")}
              </button>
              <button
                class={`chip ${settings.colorMode === "dark" ? "selected" : ""}`}
                onClick={() => handleColorMode("dark")}
              >
                <span class="material-symbols-outlined chip-icon">
                  dark_mode
                </span>
                {t("settings.dark")}
              </button>
              <button
                class={`chip ${settings.colorMode === "auto" ? "selected" : ""}`}
                onClick={() => handleColorMode("auto")}
              >
                <span class="material-symbols-outlined chip-icon">
                  brightness_auto
                </span>
                {t("settings.auto")}
              </button>
            </div>
          </section>

          <section class="settings-section">
            <label class="settings-label">{t("settings.language")}</label>
            <div class="settings-chips">
              <button
                class={`chip ${settings.locale === "en" ? "selected" : ""}`}
                onClick={() => handleLocale("en")}
              >
                English
              </button>
              <button
                class={`chip ${settings.locale === "ja" ? "selected" : ""}`}
                onClick={() => handleLocale("ja")}
              >
                日本語
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
