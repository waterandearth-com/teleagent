"use client";

import { FormEvent, PointerEvent, useEffect, useMemo, useRef, useState } from "react";
import {
  defaultLanguage,
  languageOptions,
  meals,
  options,
  translations,
  type Language,
  type MealOption,
  type Option,
  type OptionGroup
} from "@/lib/i18n";

type StepKey = "meal" | "food" | "delivery" | "mood" | "note" | "voice";
type VoicePrompt = "english" | "hebrew" | "vietnamese";
type FormConfig = {
  meals: MealOption[];
  options: Record<OptionGroup, Option[]>;
};

const steps: StepKey[] = ["meal", "food", "delivery", "mood", "note", "voice"];
const defaultFormConfig: FormConfig = { meals, options };

function getSupportedAudioType() {
  if (typeof MediaRecorder === "undefined") {
    return "";
  }

  return (
    ["audio/ogg;codecs=opus", "audio/webm;codecs=opus", "audio/webm", "audio/mp4"].find((type) =>
      MediaRecorder.isTypeSupported(type)
    ) || ""
  );
}

function getAudioExtension(type: string) {
  if (type.includes("ogg")) {
    return "ogg";
  }

  if (type.includes("mp4")) {
    return "m4a";
  }

  return "webm";
}

function LanguageSelector({
  language,
  onChange
}: {
  language: Language;
  onChange: (language: Language) => void;
}) {
  const t = translations[language].language;

  return (
    <div className="language-selector" aria-label={t.label}>
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

function FloatingHearts() {
  return (
    <div className="floating-hearts" aria-hidden="true">
      {["💗", "💕", "💖", "💘", "💗", "💕", "💖"].map((heart, index) => (
        <span key={`${heart}-${index}`}>{heart}</span>
      ))}
    </div>
  );
}

function MealCard({
  meal,
  language,
  onSelect
}: {
  meal: MealOption;
  language: Language;
  onSelect: () => void;
}) {
  return (
    <button type="button" className="meal-card" onClick={onSelect}>
      <span className="meal-emoji" aria-hidden="true">
        {meal.emoji}
      </span>
      <strong>{meal.labels[language]}</strong>
      <span>{meal.descriptions[language]}</span>
    </button>
  );
}

function OptionCard({
  option,
  group,
  language,
  selected,
  onSelect
}: {
  option: Option;
  group: OptionGroup;
  language: Language;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      className={`option-card ${selected ? "selected" : ""}`}
      onClick={onSelect}
      aria-pressed={selected}
    >
      <span className="option-emoji" aria-hidden="true">
        {option.emoji}
      </span>
      <span>{option.labels[language]}</span>
    </button>
  );
}

function Progress({ current }: { current: number }) {
  if (current === 0) {
    return null;
  }

  return (
    <div className="progress-dots" aria-hidden="true">
      {Array.from({ length: steps.length - 1 }, (_, index) => index + 1).map((dot) => (
        <span key={dot} className={dot <= current ? "active" : ""} />
      ))}
    </div>
  );
}

function ArrivalDial({
  minutes,
  onChange,
  label,
  hint,
  minuteLabel
}: {
  minutes: number;
  onChange: (minutes: number) => void;
  label: string;
  hint: string;
  minuteLabel: string;
}) {
  const dialRef = useRef<HTMLDivElement>(null);
  const progress = (minutes - 1) / 59;
  const angle = progress * Math.PI * 2 - Math.PI / 2;
  const radius = 58;
  const center = 80;
  const knobX = center + radius * Math.cos(angle);
  const knobY = center + radius * Math.sin(angle);
  const circumference = 2 * Math.PI * radius;

  function updateFromPointer(clientX: number, clientY: number) {
    const rect = dialRef.current?.getBoundingClientRect();
    if (!rect) {
      return;
    }

    const x = clientX - rect.left - rect.width / 2;
    const y = clientY - rect.top - rect.height / 2;
    let nextAngle = Math.atan2(y, x) + Math.PI / 2;

    if (nextAngle < 0) {
      nextAngle += Math.PI * 2;
    }

    onChange(Math.min(60, Math.max(1, Math.round((nextAngle / (Math.PI * 2)) * 59) + 1)));
  }

  function handlePointer(event: PointerEvent<HTMLDivElement>) {
    event.currentTarget.setPointerCapture(event.pointerId);
    updateFromPointer(event.clientX, event.clientY);
  }

  return (
    <div className="arrival-control">
      <div>
        <h2>{label}</h2>
        <p>{hint}</p>
      </div>
      <div
        ref={dialRef}
        className="arrival-dial"
        role="slider"
        tabIndex={0}
        aria-valuemin={1}
        aria-valuemax={60}
        aria-valuenow={minutes}
        onPointerDown={handlePointer}
        onPointerMove={(event) => {
          if (event.buttons === 1) {
            updateFromPointer(event.clientX, event.clientY);
          }
        }}
        onKeyDown={(event) => {
          if (event.key === "ArrowRight" || event.key === "ArrowUp") {
            event.preventDefault();
            onChange(Math.min(60, minutes + 1));
          }
          if (event.key === "ArrowLeft" || event.key === "ArrowDown") {
            event.preventDefault();
            onChange(Math.max(1, minutes - 1));
          }
        }}
      >
        <svg viewBox="0 0 160 160" aria-hidden="true">
          <circle className="arrival-track" cx={center} cy={center} r={radius} />
          <circle
            className="arrival-progress"
            cx={center}
            cy={center}
            r={radius}
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - progress)}
          />
          <line className="arrival-hand" x1={center} y1={center} x2={knobX} y2={knobY} />
          <circle className="arrival-knob" cx={knobX} cy={knobY} r="9" />
        </svg>
        <div className="arrival-value">
          <strong>{minutes}</strong>
          <span>{minuteLabel}</span>
        </div>
      </div>
    </div>
  );
}

function Confetti() {
  return (
    <div className="confetti" aria-hidden="true">
      {Array.from({ length: 24 }).map((_, index) => (
        <i key={index} />
      ))}
    </div>
  );
}

export default function Home() {
  const [language, setLanguage] = useState<Language>(defaultLanguage);
  const [formConfig, setFormConfig] = useState<FormConfig>(defaultFormConfig);
  const [step, setStep] = useState(0);
  const [selectedMeal, setSelectedMeal] = useState("");
  const [selectedFood, setSelectedFood] = useState("");
  const [customFood, setCustomFood] = useState("");
  const [deliveryPreference, setDeliveryPreference] = useState("");
  const [mood, setMood] = useState("");
  const [note, setNote] = useState("");
  const [arrivalMinutes, setArrivalMinutes] = useState(15);
  const [voicePrompt, setVoicePrompt] = useState<VoicePrompt>("english");
  const [voiceBlob, setVoiceBlob] = useState<Blob | null>(null);
  const [voiceUrl, setVoiceUrl] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  const t = translations[language];
  const currentStep = steps[step];
  const cuteLine = useMemo(() => t.welcome.lines[(new Date().getDate() - 1) % t.welcome.lines.length], [t]);
  const voicePromptOptions: { id: VoicePrompt; label: string }[] = [
    { id: "english", label: t.flow.voicePromptEnglish },
    { id: "hebrew", label: t.flow.voicePromptHebrew },
    { id: "vietnamese", label: t.flow.voicePromptVietnamese }
  ];

  useEffect(() => {
    const savedLanguage = window.localStorage.getItem("dinner-language");
    if (savedLanguage === "vi" || savedLanguage === "en") {
      setLanguage(savedLanguage);
    }
  }, []);

  useEffect(() => {
    async function loadConfig() {
      try {
        const response = await fetch("/api/form-config", { cache: "no-store" });
        if (!response.ok) {
          return;
        }

        const data = (await response.json()) as { success: boolean; config?: FormConfig };
        if (data.success && data.config) {
          setFormConfig(data.config);
        }
      } catch {
        setFormConfig(defaultFormConfig);
      }
    }

    loadConfig();
  }, []);

  useEffect(() => {
    window.localStorage.setItem("dinner-language", language);
    document.documentElement.lang = language;
  }, [language]);

  useEffect(() => {
    return () => {
      if (voiceUrl) {
        URL.revokeObjectURL(voiceUrl);
      }
    };
  }, [voiceUrl]);

  function updateLanguage(nextLanguage: Language) {
    setLanguage(nextLanguage);
    setError("");
  }

  function validateCurrentStep() {
    if (currentStep === "meal" && !selectedMeal) {
      return t.errors.chooseMeal;
    }

    if (currentStep === "food") {
      if (!selectedFood) {
        return t.errors.chooseFood;
      }

      if (selectedFood === "other" && !customFood.trim()) {
        return t.errors.customFood;
      }
    }

    if (currentStep === "delivery" && !deliveryPreference) {
      return t.errors.chooseDelivery;
    }

    if (currentStep === "mood" && !mood) {
      return t.errors.chooseMood;
    }

    if (currentStep === "voice" && !voiceBlob) {
      return t.errors.voiceRequired;
    }

    return "";
  }

  function goNext() {
    const nextError = validateCurrentStep();
    if (nextError) {
      setError(nextError);
      return;
    }

    setError("");
    setStep((value) => Math.min(value + 1, steps.length - 1));
  }

  function goBack() {
    setError("");
    setStep((value) => Math.max(value - 1, 0));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextError = validateCurrentStep();
    if (nextError) {
      setError(nextError);
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      if (!voiceBlob) {
        throw new Error("Missing voice note");
      }

      const formData = new FormData();
      const voiceType = voiceBlob.type || "audio/webm";
      formData.append("language", language);
      formData.append("meal", selectedMeal);
      formData.append("selectedFood", selectedFood);
      formData.append("customFood", customFood);
      formData.append("deliveryPreference", deliveryPreference);
      formData.append("mood", mood);
      formData.append("note", note);
      formData.append("arrivalMinutes", String(arrivalMinutes));
      formData.append("voicePrompt", voicePrompt);
      formData.append("voice", voiceBlob, `love-message.${getAudioExtension(voiceType)}`);

      const response = await fetch("/api/submit-choice", {
        method: "POST",
        body: formData
      });

      if (!response.ok) {
        throw new Error("Submit failed");
      }

      setIsSuccess(true);
    } catch {
      setError(t.errors.submitFailed);
    } finally {
      setIsSubmitting(false);
    }
  }

  function resetFlow() {
    setStep(0);
    setSelectedMeal("");
    setSelectedFood("");
    setCustomFood("");
    setDeliveryPreference("");
    setMood("");
    setNote("");
    setArrivalMinutes(15);
    setVoicePrompt("english");
    setVoiceBlob(null);
    setVoiceUrl("");
    setError("");
    setIsSuccess(false);
  }

  async function startRecording() {
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
      setError(t.errors.microphoneFailed);
      return;
    }

    try {
      if (voiceUrl) {
        URL.revokeObjectURL(voiceUrl);
      }

      setVoiceBlob(null);
      setVoiceUrl("");
      setError("");

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = getSupportedAudioType();
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);

      streamRef.current = stream;
      chunksRef.current = [];
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const type = recorder.mimeType || mimeType || "audio/webm";
        const blob = new Blob(chunksRef.current, { type });
        setVoiceBlob(blob);
        setVoiceUrl(URL.createObjectURL(blob));
        setIsRecording(false);
        streamRef.current?.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      };

      recorder.start();
      setIsRecording(true);
    } catch {
      setIsRecording(false);
      setError(t.errors.microphoneFailed);
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  }

  function stopRecording() {
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop();
    }
  }

  function renderOptionGrid(group: OptionGroup, selectedValue: string, onSelect: (id: string) => void) {
    return (
      <div className="option-grid">
        {formConfig.options[group].map((option) => (
          <OptionCard
            key={option.id}
            option={option}
            group={group}
            language={language}
            selected={selectedValue === option.id}
            onSelect={() => {
              onSelect(option.id);
              setError("");
            }}
          />
        ))}
      </div>
    );
  }

  return (
    <main className="app-shell">
      <FloatingHearts />
      <LanguageSelector language={language} onChange={updateLanguage} />

      <section className={`phone-surface ${isSuccess ? "success-mode" : ""}`}>
        {isSuccess ? (
          <div className="success-screen">
            <Confetti />
            <div className="success-heart">{t.success.heart}</div>
            <h1>{t.success.title}</h1>
            <p>{t.success.body}</p>
            <span>{t.success.subtext}</span>
            <button type="button" className="primary-button" onClick={resetFlow}>
              {t.success.again}
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <Progress current={step} />

            {currentStep === "meal" && (
              <div className="welcome-panel panel-enter">
                <div className="heart-badge">💗</div>
                <h1>{t.welcome.title}</h1>
                <p className="subtitle">{t.welcome.subtitle}</p>
                <p className="cute-line">{cuteLine}</p>
                <div className="meal-picker">
                  <div>
                    <h2>{t.welcome.mealTitle}</h2>
                    <p>{t.welcome.mealSubtitle}</p>
                  </div>
                  <div className="meal-grid">
                    {formConfig.meals.map((meal) => (
                      <MealCard
                        key={meal.id}
                        meal={meal}
                        language={language}
                        onSelect={() => {
                          setSelectedMeal(meal.id);
                          setError("");
                          setStep(1);
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {currentStep === "food" && (
              <div className="question-panel panel-enter">
                <p className="step-label">
                  {t.flow.step} 1/5
                </p>
                <h1>{t.flow.foodQuestion}</h1>
                {renderOptionGrid("food", selectedFood, setSelectedFood)}

                {selectedFood === "other" && (
                  <label className="text-field">
                    <span>{t.flow.customFoodLabel}</span>
                    <input
                      value={customFood}
                      onChange={(event) => setCustomFood(event.target.value)}
                      placeholder={t.flow.customFoodPlaceholder}
                      maxLength={120}
                    />
                  </label>
                )}
              </div>
            )}

            {currentStep === "delivery" && (
              <div className="question-panel panel-enter">
                <p className="step-label">
                  {t.flow.step} 2/5
                </p>
                <h1>{t.flow.deliveryQuestion}</h1>
                {renderOptionGrid("delivery", deliveryPreference, setDeliveryPreference)}
              </div>
            )}

            {currentStep === "mood" && (
              <div className="question-panel panel-enter">
                <p className="step-label">
                  {t.flow.step} 3/5
                </p>
                <h1>{t.flow.moodQuestion}</h1>
                {renderOptionGrid("mood", mood, setMood)}
              </div>
            )}

            {currentStep === "note" && (
              <div className="question-panel panel-enter">
                <p className="step-label">
                  {t.flow.step} 4/5 · {t.flow.optional}
                </p>
                <h1>{t.flow.noteQuestion}</h1>
                <label className="text-field">
                  <textarea
                    value={note}
                    onChange={(event) => setNote(event.target.value)}
                    placeholder={t.flow.notePlaceholder}
                    rows={5}
                    maxLength={300}
                  />
                </label>
              </div>
            )}

            {currentStep === "voice" && (
              <div className="question-panel voice-panel panel-enter">
                <p className="step-label">
                  {t.flow.step} 5/5
                </p>
                <h1>{t.flow.voiceQuestion}</h1>
                <p className="voice-intro">{t.flow.voiceIntro}</p>

                <div className="voice-prompt-card">
                  <h2>{t.flow.voicePromptTitle}</h2>
                  <div className="phrase-grid">
                    {voicePromptOptions.map((option) => (
                      <button
                        type="button"
                        className={`phrase-option ${voicePrompt === option.id ? "selected" : ""}`}
                        key={option.id}
                        onClick={() => setVoicePrompt(option.id)}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="voice-recorder">
                  <button
                    type="button"
                    className={`record-button ${isRecording ? "recording" : ""}`}
                    onClick={isRecording ? stopRecording : startRecording}
                  >
                    <span aria-hidden="true">{isRecording ? "■" : "●"}</span>
                    {isRecording ? t.flow.stopRecording : voiceBlob ? t.flow.rerecordVoice : t.flow.recordVoice}
                  </button>
                  <p>{isRecording ? t.flow.recording : voiceBlob ? t.flow.voiceReady : voicePromptOptions.find((option) => option.id === voicePrompt)?.label}</p>
                  {voiceUrl && <audio controls src={voiceUrl} />}
                </div>

                <ArrivalDial
                  minutes={arrivalMinutes}
                  onChange={setArrivalMinutes}
                  label={t.flow.arrivalQuestion}
                  hint={t.flow.arrivalHint}
                  minuteLabel={t.flow.minutes}
                />
              </div>
            )}

            {error && <p className="error-message">{error}</p>}

            {currentStep !== "meal" && (
              <div className="button-row">
                <button type="button" className="ghost-button" onClick={goBack}>
                  {t.flow.back}
                </button>
                {currentStep === "voice" ? (
                  <button type="submit" className="primary-button" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <span className="sending-state">
                        <span className="mini-heart" />
                        {t.flow.sending}
                      </span>
                    ) : (
                      t.flow.submit
                    )}
                  </button>
                ) : (
                  <button type="button" className="primary-button" onClick={goNext}>
                    {t.flow.next}
                  </button>
                )}
              </div>
            )}
          </form>
        )}
      </section>
    </main>
  );
}
