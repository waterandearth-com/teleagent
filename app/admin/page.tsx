"use client";

import { FormEvent, useEffect, useState } from "react";
import {
  languageOptions,
  meals,
  options,
  translations,
  type Language,
  type MealOption,
  type Option,
  type OptionGroup
} from "@/lib/i18n";

type FormConfig = {
  meals: MealOption[];
  options: Record<OptionGroup, Option[]>;
};

const defaultConfig: FormConfig = { meals, options };
const groups: { id: OptionGroup; title: string }[] = [
  { id: "food", title: "Food choices" },
  { id: "delivery", title: "How to eat" },
  { id: "mood", title: "Mood choices" }
];

function LanguageSelector({
  language,
  onChange
}: {
  language: Language;
  onChange: (language: Language) => void;
}) {
  const t = translations[language].language;

  return (
    <div className="language-selector admin-language" aria-label={t.label}>
      <span className="sr-only">{t.label}</span>
      <select
        value={language}
        onChange={(event) => onChange(event.target.value as Language)}
        aria-label={t.label}
      >
        {languageOptions.map((option) => (
          <option key={option.code} value={option.code}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function makeOption(group: OptionGroup): Option {
  const id = `${group}-${Date.now()}`;

  return {
    id,
    emoji: "✨",
    labels: {
      vi: "Lựa chọn mới",
      en: "New option"
    }
  };
}

export default function AdminPage() {
  const [language, setLanguage] = useState<Language>("en");
  const [password, setPassword] = useState("");
  const [config, setConfig] = useState<FormConfig>(defaultConfig);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const savedLanguage = window.localStorage.getItem("dinner-language");
    if (savedLanguage === "vi" || savedLanguage === "en") {
      setLanguage(savedLanguage);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem("dinner-language", language);
    document.documentElement.lang = language;
  }, [language]);

  async function loadConfig(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();
    setIsLoading(true);
    setError("");
    setStatus("");

    try {
      const response = await fetch("/api/admin/config", {
        headers: { "x-admin-password": password }
      });

      if (!response.ok) {
        throw new Error("Unable to load config");
      }

      const data = (await response.json()) as { success: boolean; config?: FormConfig };
      if (!data.success || !data.config) {
        throw new Error("Unable to load config");
      }

      setConfig(data.config);
      setIsUnlocked(true);
      setStatus("Loaded.");
    } catch {
      setError("Could not unlock admin. Check the password.");
      setIsUnlocked(false);
    } finally {
      setIsLoading(false);
    }
  }

  async function saveConfig() {
    setIsLoading(true);
    setError("");
    setStatus("");

    try {
      const response = await fetch("/api/admin/config", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-admin-password": password
        },
        body: JSON.stringify({ config })
      });

      if (!response.ok) {
        throw new Error("Unable to save config");
      }

      const data = (await response.json()) as { success: boolean; config?: FormConfig };
      if (!data.success || !data.config) {
        throw new Error("Unable to save config");
      }

      setConfig(data.config);
      setStatus("Saved. Refresh the main app to see the changes.");
    } catch {
      setError("Could not save changes.");
    } finally {
      setIsLoading(false);
    }
  }

  function updateMeal(index: number, updater: (meal: MealOption) => MealOption) {
    setConfig((current) => ({
      ...current,
      meals: current.meals.map((meal, mealIndex) => (mealIndex === index ? updater(meal) : meal))
    }));
  }

  function updateOption(group: OptionGroup, index: number, updater: (option: Option) => Option) {
    setConfig((current) => ({
      ...current,
      options: {
        ...current.options,
        [group]: current.options[group].map((option, optionIndex) =>
          optionIndex === index ? updater(option) : option
        )
      }
    }));
  }

  function addOption(group: OptionGroup) {
    setConfig((current) => ({
      ...current,
      options: {
        ...current.options,
        [group]: [...current.options[group], makeOption(group)]
      }
    }));
  }

  function removeOption(group: OptionGroup, index: number) {
    setConfig((current) => ({
      ...current,
      options: {
        ...current.options,
        [group]: current.options[group].filter((_, optionIndex) => optionIndex !== index)
      }
    }));
  }

  return (
    <main className="admin-shell">
      <LanguageSelector language={language} onChange={setLanguage} />

      <section className="admin-content">
        <header>
          <p className="admin-kicker">Settings</p>
          <h1>Form editor</h1>
          <p>Edit what she sees in the meal cards and form answer choices.</p>
        </header>

        <form className="admin-login" onSubmit={loadConfig}>
          <label className="text-field">
            <span>Admin password</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter admin password"
            />
          </label>
          <button type="submit" className="primary-button" disabled={isLoading}>
            {isLoading ? "Loading..." : "Unlock editor"}
          </button>
        </form>

        {error && <p className="error-message">{error}</p>}
        {status && <p className="success-message">{status}</p>}

        {isUnlocked && (
          <div className="admin-editor">
            <section className="editor-section">
              <div className="editor-heading">
                <h2>Meal cards</h2>
                <p>Main screen choices: morning, lunch, and dinner.</p>
              </div>

              <div className="editor-list">
                {config.meals.map((meal, index) => (
                  <article className="editor-row" key={meal.id}>
                    <label>
                      <span>Emoji</span>
                      <input
                        value={meal.emoji}
                        onChange={(event) =>
                          updateMeal(index, (item) => ({ ...item, emoji: event.target.value }))
                        }
                      />
                    </label>
                    <label>
                      <span>Vietnamese title</span>
                      <input
                        value={meal.labels.vi}
                        onChange={(event) =>
                          updateMeal(index, (item) => ({
                            ...item,
                            labels: { ...item.labels, vi: event.target.value }
                          }))
                        }
                      />
                    </label>
                    <label>
                      <span>English title</span>
                      <input
                        value={meal.labels.en}
                        onChange={(event) =>
                          updateMeal(index, (item) => ({
                            ...item,
                            labels: { ...item.labels, en: event.target.value }
                          }))
                        }
                      />
                    </label>
                    <label>
                      <span>Vietnamese subtitle</span>
                      <input
                        value={meal.descriptions.vi}
                        onChange={(event) =>
                          updateMeal(index, (item) => ({
                            ...item,
                            descriptions: { ...item.descriptions, vi: event.target.value }
                          }))
                        }
                      />
                    </label>
                    <label>
                      <span>English subtitle</span>
                      <input
                        value={meal.descriptions.en}
                        onChange={(event) =>
                          updateMeal(index, (item) => ({
                            ...item,
                            descriptions: { ...item.descriptions, en: event.target.value }
                          }))
                        }
                      />
                    </label>
                  </article>
                ))}
              </div>
            </section>

            {groups.map((group) => (
              <section className="editor-section" key={group.id}>
                <div className="editor-heading">
                  <h2>{group.title}</h2>
                  <button type="button" className="ghost-button compact-button" onClick={() => addOption(group.id)}>
                    Add option
                  </button>
                </div>

                <div className="editor-list">
                  {config.options[group.id].map((option, index) => (
                    <article className="editor-row option-editor-row" key={option.id}>
                      <label>
                        <span>Emoji</span>
                        <input
                          value={option.emoji}
                          onChange={(event) =>
                            updateOption(group.id, index, (item) => ({
                              ...item,
                              emoji: event.target.value
                            }))
                          }
                        />
                      </label>
                      <label>
                        <span>Vietnamese</span>
                        <input
                          value={option.labels.vi}
                          onChange={(event) =>
                            updateOption(group.id, index, (item) => ({
                              ...item,
                              labels: { ...item.labels, vi: event.target.value }
                            }))
                          }
                        />
                      </label>
                      <label>
                        <span>English</span>
                        <input
                          value={option.labels.en}
                          onChange={(event) =>
                            updateOption(group.id, index, (item) => ({
                              ...item,
                              labels: { ...item.labels, en: event.target.value }
                            }))
                          }
                        />
                      </label>
                      <button
                        type="button"
                        className="danger-button"
                        onClick={() => removeOption(group.id, index)}
                        disabled={config.options[group.id].length <= 1}
                      >
                        Remove
                      </button>
                    </article>
                  ))}
                </div>
              </section>
            ))}

            <div className="editor-actions">
              <button type="button" className="primary-button" onClick={saveConfig} disabled={isLoading}>
                {isLoading ? "Saving..." : "Save changes"}
              </button>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
