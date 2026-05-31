import { translations, type Language } from "./i18n";

export type TelegramSubmission = {
  createdAt: string;
  language: Language;
  mealLabel: string;
  arrivalMinutes: number;
  voicePromptLabel: string;
  selectedFood: string;
  selectedFoodLabel: string;
  customFood?: string;
  deliveryPreferenceLabel: string;
  moodLabel: string;
  note?: string;
};

export type FreeRequestSubmission = {
  createdAt: string;
  language: Language;
  requestLabels: string[];
  customRequest?: string;
};

function formatChoice(submission: TelegramSubmission) {
  if (submission.selectedFood === "other" && submission.customFood) {
    return `${submission.selectedFoodLabel} - ${submission.customFood}`;
  }

  return submission.selectedFoodLabel;
}

async function postTelegramForm(token: string, method: "sendVoice" | "sendAudio" | "sendDocument", formData: FormData) {
  return fetch(`https://api.telegram.org/bot${token}/${method}`, {
    method: "POST",
    body: formData
  });
}

async function sendVoiceFile(token: string, chatId: string, voice: Blob, fileName?: string) {
  const safeFileName = fileName || "love-message.webm";
  const caption = "Voice note";

  const voiceForm = new FormData();
  voiceForm.append("chat_id", chatId);
  voiceForm.append("voice", voice, safeFileName);
  voiceForm.append("caption", caption);

  const voiceResponse = await postTelegramForm(token, "sendVoice", voiceForm);
  if (voiceResponse.ok) {
    return;
  }

  const audioForm = new FormData();
  audioForm.append("chat_id", chatId);
  audioForm.append("audio", voice, safeFileName);
  audioForm.append("caption", caption);

  const audioResponse = await postTelegramForm(token, "sendAudio", audioForm);
  if (audioResponse.ok) {
    return;
  }

  const documentForm = new FormData();
  documentForm.append("chat_id", chatId);
  documentForm.append("document", voice, safeFileName);
  documentForm.append("caption", caption);

  const documentResponse = await postTelegramForm(token, "sendDocument", documentForm);
  if (!documentResponse.ok) {
    throw new Error(`Telegram voice upload failed with status ${documentResponse.status}`);
  }
}

export async function sendTelegramNotification(submission: TelegramSubmission, voice: Blob, fileName?: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    throw new Error("Telegram credentials are missing");
  }

  const language: Language = submission.language;
  const t = translations[language].notification;
  const text = [
    t.title,
    "",
    t.meal,
    submission.mealLabel,
    "",
    t.food,
    formatChoice(submission),
    "",
    t.delivery,
    submission.deliveryPreferenceLabel,
    "",
    t.mood,
    submission.moodLabel,
    "",
    t.arrival,
    `${submission.arrivalMinutes} minutes`,
    "",
    t.voicePrompt,
    submission.voicePromptLabel,
    "",
    t.note,
    submission.note || t.noNote,
    "",
    t.time,
    new Intl.DateTimeFormat(language === "vi" ? "vi-VN" : "en-GB", {
      dateStyle: "medium",
      timeStyle: "short"
    }).format(new Date(submission.createdAt))
  ].join("\n");

  const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text
    })
  });

  if (!response.ok) {
    throw new Error(`Telegram notification failed with status ${response.status}`);
  }

  await sendVoiceFile(token, chatId, voice, fileName);
}

export async function sendTelegramFreeRequest(submission: FreeRequestSubmission) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    throw new Error("Telegram credentials are missing");
  }

  const language: Language = submission.language;
  const t = translations[language].notification;
  const text = [
    t.freeRequestTitle,
    "",
    t.requests,
    submission.requestLabels.map((label) => `- ${label}`).join("\n"),
    "",
    t.customRequest,
    submission.customRequest || t.noNote,
    "",
    t.time,
    new Intl.DateTimeFormat(language === "vi" ? "vi-VN" : "en-GB", {
      dateStyle: "medium",
      timeStyle: "short"
    }).format(new Date(submission.createdAt))
  ].join("\n");

  const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text
    })
  });

  if (!response.ok) {
    throw new Error(`Telegram free request failed with status ${response.status}`);
  }
}
