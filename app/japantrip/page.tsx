"use client";

import { useEffect, useState } from "react";

const flightTarget = new Date("2026-06-19T20:50:00+07:00");
const flightCode = "HX547";
const flightRoute = "Da Nang (DAD) → Hong Kong (HKG)";
const flightTime = "19 ביוני 2026, 20:50 זמן וייטנאם";

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

function calendarDaysUntil(target: Date, now: Date) {
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
  const end = new Date(target.getFullYear(), target.getMonth(), target.getDate(), 0, 0, 0, 0);
  return Math.max(0, Math.round((end.getTime() - start.getTime()) / 86400000));
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
  const target = flightTarget;
  const parts = now ? countdownParts(target, now) : { days: 0, hours: 0, minutes: 0, seconds: 0 };
  const calendarDays = now ? calendarDaysUntil(target, now) : 0;
  const businessDays = now && now < target ? businessDaysUntil(target, now) : 0;
  const targetLabel = target.toLocaleString("he-IL", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Ho_Chi_Minh"
  });

  useEffect(() => {
    setNow(new Date());
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <main className="japan-trip-page" dir="rtl">
      <section className="japan-trip-panel" aria-label="טיימר לנסיעה ליפן">
        <p className="japan-trip-kicker">Japan Trip · {flightCode}</p>
        <h1>טיסה ליפן</h1>
        <p className="japan-trip-target">טיימר עד המראת {flightCode}</p>
        <div className="japan-trip-flight">
          <strong>{flightRoute}</strong>
          <span>{flightTime}</span>
          <small>מוצג לפי זמן וייטנאם: {targetLabel}</small>
        </div>

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
