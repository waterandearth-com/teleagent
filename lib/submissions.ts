import { randomUUID } from "crypto";
import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import type { Language } from "./i18n";

export type Submission = {
  id: string;
  createdAt: string;
  language: Language;
  selectedFood: string;
  selectedFoodLabel: string;
  customFood?: string;
  deliveryPreference: string;
  deliveryPreferenceLabel: string;
  mood: string;
  moodLabel: string;
  note?: string;
};

type SupabaseRow = {
  id: string;
  created_at: string;
  language: Language;
  selected_food: string;
  selected_food_label: string;
  custom_food: string | null;
  delivery_preference: string;
  delivery_preference_label: string;
  mood: string;
  mood_label: string;
  note: string | null;
};

const tableName = process.env.SUPABASE_TABLE || "dinner_choices";
const localFile =
  process.env.SUBMISSIONS_FILE || path.join(process.cwd(), ".data", "submissions.json");

function hasSupabaseConfig() {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

function toSupabaseRow(submission: Submission): Omit<SupabaseRow, "id" | "created_at"> & {
  id: string;
  created_at: string;
} {
  return {
    id: submission.id,
    created_at: submission.createdAt,
    language: submission.language,
    selected_food: submission.selectedFood,
    selected_food_label: submission.selectedFoodLabel,
    custom_food: submission.customFood || null,
    delivery_preference: submission.deliveryPreference,
    delivery_preference_label: submission.deliveryPreferenceLabel,
    mood: submission.mood,
    mood_label: submission.moodLabel,
    note: submission.note || null
  };
}

function fromSupabaseRow(row: SupabaseRow): Submission {
  return {
    id: row.id,
    createdAt: row.created_at,
    language: row.language,
    selectedFood: row.selected_food,
    selectedFoodLabel: row.selected_food_label,
    customFood: row.custom_food || undefined,
    deliveryPreference: row.delivery_preference,
    deliveryPreferenceLabel: row.delivery_preference_label,
    mood: row.mood,
    moodLabel: row.mood_label,
    note: row.note || undefined
  };
}

async function readLocalSubmissions(): Promise<Submission[]> {
  try {
    const content = await readFile(localFile, "utf8");
    return JSON.parse(content) as Submission[];
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return [];
    }
    throw error;
  }
}

async function writeLocalSubmissions(submissions: Submission[]) {
  await mkdir(path.dirname(localFile), { recursive: true });
  await writeFile(localFile, JSON.stringify(submissions, null, 2), "utf8");
}

async function saveLocalSubmission(submission: Submission) {
  const submissions = await readLocalSubmissions();
  submissions.unshift(submission);
  await writeLocalSubmissions(submissions);
}

async function saveSupabaseSubmission(submission: Submission) {
  const response = await fetch(`${process.env.SUPABASE_URL}/rest/v1/${tableName}`, {
    method: "POST",
    headers: {
      apikey: process.env.SUPABASE_SERVICE_ROLE_KEY || "",
      Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
      "Content-Type": "application/json",
      Prefer: "return=minimal"
    },
    body: JSON.stringify(toSupabaseRow(submission))
  });

  if (!response.ok) {
    throw new Error(`Supabase save failed with status ${response.status}`);
  }
}

async function listSupabaseSubmissions(): Promise<Submission[]> {
  const response = await fetch(
    `${process.env.SUPABASE_URL}/rest/v1/${tableName}?select=*&order=created_at.desc`,
    {
      headers: {
        apikey: process.env.SUPABASE_SERVICE_ROLE_KEY || "",
        Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`
      },
      cache: "no-store"
    }
  );

  if (!response.ok) {
    throw new Error(`Supabase read failed with status ${response.status}`);
  }

  const rows = (await response.json()) as SupabaseRow[];
  return rows.map(fromSupabaseRow);
}

export function createSubmission(input: Omit<Submission, "id" | "createdAt">): Submission {
  return {
    id: randomUUID(),
    createdAt: new Date().toISOString(),
    ...input
  };
}

export async function saveSubmission(submission: Submission) {
  if (hasSupabaseConfig()) {
    await saveSupabaseSubmission(submission);
    return;
  }

  await saveLocalSubmission(submission);
}

export async function listSubmissions(): Promise<Submission[]> {
  if (hasSupabaseConfig()) {
    return listSupabaseSubmissions();
  }

  return readLocalSubmissions();
}
