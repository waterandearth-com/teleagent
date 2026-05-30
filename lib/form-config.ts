import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import {
  languages,
  meals,
  options,
  type Language,
  type MealOption,
  type Option,
  type OptionGroup
} from "./i18n";

export type FormConfig = {
  meals: MealOption[];
  options: Record<OptionGroup, Option[]>;
};

const configFile = process.env.FORM_CONFIG_FILE || path.join(process.cwd(), ".data", "form-config.json");
const optionGroups: OptionGroup[] = ["food", "delivery", "mood"];

export const defaultFormConfig: FormConfig = {
  meals,
  options
};

function sanitizeText(value: unknown, fallback = "") {
  if (typeof value !== "string") {
    return fallback;
  }

  return value.replace(/[<>]/g, "").trim().slice(0, 120) || fallback;
}

function sanitizeId(value: unknown, fallback: string) {
  const clean =
    typeof value === "string"
      ? value
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9-]+/g, "-")
          .replace(/^-+|-+$/g, "")
          .slice(0, 48)
      : "";

  return clean || fallback;
}

function sanitizeLabels(value: unknown, fallback: Record<Language, string>) {
  const input = typeof value === "object" && value !== null ? (value as Record<string, unknown>) : {};

  return languages.reduce(
    (labels, language) => ({
      ...labels,
      [language]: sanitizeText(input[language], fallback[language])
    }),
    {} as Record<Language, string>
  );
}

function normalizeOption(input: unknown, fallback: Option, index: number): Option {
  const value = typeof input === "object" && input !== null ? (input as Record<string, unknown>) : {};

  return {
    id: sanitizeId(value.id, fallback.id || `option-${index + 1}`),
    emoji: sanitizeText(value.emoji, fallback.emoji || "✨").slice(0, 8),
    labels: sanitizeLabels(value.labels, fallback.labels)
  };
}

function normalizeMeal(input: unknown, fallback: MealOption, index: number): MealOption {
  const value = typeof input === "object" && input !== null ? (input as Record<string, unknown>) : {};

  return {
    id: fallback.id,
    emoji: sanitizeText(value.emoji, fallback.emoji || "✨").slice(0, 8),
    labels: sanitizeLabels(value.labels, fallback.labels),
    descriptions: sanitizeLabels(value.descriptions, fallback.descriptions)
  };
}

function normalizeOptions(group: OptionGroup, input: unknown): Option[] {
  const fallbackOptions = defaultFormConfig.options[group];
  const inputOptions = Array.isArray(input) ? input : fallbackOptions;
  const fallbackByIndex = (index: number): Option =>
    fallbackOptions[index] || {
      id: `option-${index + 1}`,
      emoji: "✨",
      labels: { vi: `Lựa chọn ${index + 1}`, en: `Option ${index + 1}` }
    };

  const normalized = inputOptions
    .map((option, index) => normalizeOption(option, fallbackByIndex(index), index))
    .filter((option) => option.labels.vi && option.labels.en);

  const uniqueIds = new Set<string>();

  return normalized.map((option, index) => {
    let id = option.id;
    if (uniqueIds.has(id)) {
      id = `${id}-${index + 1}`;
    }
    uniqueIds.add(id);
    return { ...option, id };
  });
}

export function normalizeFormConfig(input: unknown): FormConfig {
  const value = typeof input === "object" && input !== null ? (input as Record<string, unknown>) : {};
  const inputOptions =
    typeof value.options === "object" && value.options !== null
      ? (value.options as Record<string, unknown>)
      : {};

  return {
    meals: defaultFormConfig.meals.map((meal, index) =>
      normalizeMeal(Array.isArray(value.meals) ? value.meals[index] : undefined, meal, index)
    ),
    options: optionGroups.reduce(
      (result, group) => ({
        ...result,
        [group]: normalizeOptions(group, inputOptions[group])
      }),
      {} as Record<OptionGroup, Option[]>
    )
  };
}

export async function readFormConfig(): Promise<FormConfig> {
  try {
    const content = await readFile(configFile, "utf8");
    return normalizeFormConfig(JSON.parse(content));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return defaultFormConfig;
    }
    throw error;
  }
}

export async function writeFormConfig(config: unknown): Promise<FormConfig> {
  const normalized = normalizeFormConfig(config);
  await mkdir(path.dirname(configFile), { recursive: true });
  await writeFile(configFile, JSON.stringify(normalized, null, 2), "utf8");
  return normalized;
}
