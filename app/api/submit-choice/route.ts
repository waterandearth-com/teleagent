import { NextResponse } from "next/server";
import { defaultLanguage, isLanguage, type Language, type Option, type OptionGroup } from "@/lib/i18n";
import { readFormConfig } from "@/lib/form-config";
import { sendTelegramNotification } from "@/lib/telegram";

export const runtime = "nodejs";

const maxTextLength = 300;

type SubmitPayload = {
  language?: unknown;
  meal?: unknown;
  selectedFood?: unknown;
  customFood?: unknown;
  deliveryPreference?: unknown;
  mood?: unknown;
  note?: unknown;
  arrivalMinutes?: unknown;
  voicePrompt?: unknown;
  voice?: Blob;
  voiceFileName?: string;
};

function sanitize(value: unknown) {
  if (typeof value !== "string") {
    return "";
  }

  return value.replace(/[<>]/g, "").trim().slice(0, maxTextLength);
}

function invalid() {
  return NextResponse.json({ success: false }, { status: 400 });
}

function sanitizeMinutes(value: unknown) {
  const minutes = Number.parseInt(typeof value === "string" ? value : "", 10);

  if (!Number.isFinite(minutes)) {
    return 0;
  }

  return Math.min(60, Math.max(1, minutes));
}

function findOption(options: Record<OptionGroup, Option[]>, group: OptionGroup, id: string) {
  return options[group].find((option) => option.id === id);
}

async function parsePayload(request: Request): Promise<SubmitPayload | null> {
  const contentType = request.headers.get("content-type") || "";

  if (contentType.includes("multipart/form-data")) {
    const formData = await request.formData();
    const voice = formData.get("voice");

    return {
      language: formData.get("language"),
      meal: formData.get("meal"),
      selectedFood: formData.get("selectedFood"),
      customFood: formData.get("customFood"),
      deliveryPreference: formData.get("deliveryPreference"),
      mood: formData.get("mood"),
      note: formData.get("note"),
      arrivalMinutes: formData.get("arrivalMinutes"),
      voicePrompt: formData.get("voicePrompt"),
      voice: voice instanceof Blob ? voice : undefined,
      voiceFileName:
        voice instanceof Blob && typeof (voice as { name?: unknown }).name === "string"
          ? ((voice as { name: string }).name)
          : undefined
    };
  }

  return (await request.json()) as SubmitPayload;
}

function getVoicePromptLabel(value: string) {
  if (value === "hebrew") {
    return "Ani ohevet otcha";
  }

  if (value === "vietnamese") {
    return "Em yêu anh";
  }

  return "I love you";
}

export async function POST(request: Request) {
  let payload: SubmitPayload;

  try {
    const parsedPayload = await parsePayload(request);
    if (!parsedPayload) {
      return invalid();
    }
    payload = parsedPayload;
  } catch {
    return invalid();
  }

  const language: Language = isLanguage(payload.language) ? payload.language : defaultLanguage;
  const meal = sanitize(payload.meal);
  const selectedFood = sanitize(payload.selectedFood);
  const customFood = sanitize(payload.customFood);
  const deliveryPreference = sanitize(payload.deliveryPreference);
  const mood = sanitize(payload.mood);
  const note = sanitize(payload.note);
  const arrivalMinutes = sanitizeMinutes(payload.arrivalMinutes);
  const voicePrompt = sanitize(payload.voicePrompt);
  const voice = payload.voice;

  const config = await readFormConfig();
  const mealOption = config.meals.find((item) => item.id === meal);
  const foodOption = findOption(config.options, "food", selectedFood);
  const deliveryOption = findOption(config.options, "delivery", deliveryPreference);
  const moodOption = findOption(config.options, "mood", mood);

  if (!mealOption || !foodOption || !deliveryOption || !moodOption) {
    return invalid();
  }

  if (selectedFood === "other" && !customFood) {
    return invalid();
  }

  if (!arrivalMinutes || !voice || voice.size === 0 || voice.size > 8 * 1024 * 1024) {
    return invalid();
  }

  const submission = {
    createdAt: new Date().toISOString(),
    language: "en" as const,
    mealLabel: mealOption.labels.en,
    arrivalMinutes,
    voicePromptLabel: getVoicePromptLabel(voicePrompt),
    selectedFood,
    selectedFoodLabel: foodOption.labels.en,
    customFood: customFood || undefined,
    deliveryPreference,
    deliveryPreferenceLabel: deliveryOption.labels.en,
    mood,
    moodLabel: moodOption.labels.en,
    note: note || undefined
  };

  try {
    await sendTelegramNotification(submission, voice, payload.voiceFileName);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
