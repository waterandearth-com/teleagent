"use client";

import { useEffect, useMemo, useState } from "react";

const dayMs = 24 * 60 * 60 * 1000;

function targetForCurrentMonth(now: Date) {
  return new Date(now.getFullYear(), now.getMonth(), 19, 0, 0, 0, 0);
}

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function isBusinessDay(date: Date) {
  const day = date.getDay();
  return day !== 0 && day !== 6;
}

function businessDaysUntil(target: Date, now: Date) {
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
  const end = new Date(target.getFullYear(), target.getMonth(), target.getDate(), 0, 0, 0, 0);
  let count = 0;

  for (let cursor = new Date(start); cursor <= end; cursor.setDate(cursor.getDate() + 1)) {
    if (cursor >= start && isBusinessDay(cursor)) {
      count += 1;
    }
  }

  return count;
}

function countdownParts(target: Date, now: Date) {
  const remainingMs = Math.max(0, target.getTime() - now.getTime());
  const totalSeconds = Math.floor(remainingMs / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return { days, hours, minutes, seconds };
}

export default function JapanTripPage() {
  const [now, setNow] = useState<Date | null>(null);
  const displayNow = now ?? new Date();
  const target = useMemo(() => targetForCurrentMonth(displayNow), [displayNow]);
  const parts = now ? countdownParts(target, now) : { days: 0, hours: 0, minutes: 0, seconds: 0 };
  const calendarDays = now ? Math.max(0, Math.ceil((target.getTime() - now.getTime()) / dayMs)) : 0;
  const businessDays = now && now < target ? businessDaysUntil(target, now) : 0;
  const targetLabel = target.toLocaleDateString("he-IL", {
    day: "numeric",
    month: "long",
    year: "numeric"
  });

  useEffect(() => {
    setNow(new Date());
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <main className="japan-trip-page" dir="rtl">
      <section className="japan-trip-panel" aria-label="טיימר לנסיעה ליפן">
        <p className="japan-trip-kicker">Japan Trip</p>
        <h1>עוד רגע יפן</h1>
        <p className="japan-trip-target">טיימר עד {targetLabel}</p>

        <div className="japan-trip-countdown" aria-live="polite">
          <span>{parts.days}</span>
          <small>ימים</small>
          <span>{pad(parts.hours)}</span>
          <small>שעות</small>
          <span>{pad(parts.minutes)}</span>
          <small>דקות</small>
          <span>{pad(parts.seconds)}</span>
          <small>שניות</small>
        </div>

        <div className="japan-trip-stats">
          <article>
            <strong>{calendarDays}</strong>
            <span>ימים רגילים נשארו</span>
          </article>
          <article>
            <strong>{businessDays}</strong>
            <span>ימי עסקים נשארו</span>
          </article>
        </div>
      </section>
    </main>
  );
}
