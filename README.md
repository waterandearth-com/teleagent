# Romantic Dinner Choice

A mobile-first dinner picker with Vietnamese as the default language and English as the secondary language.

## Features

- Top-right language selector: `🇻🇳 Tiếng Việt` and `🇬🇧 English`
- All app, admin, validation, success, and notification text supports both languages
- Vietnamese is the default language
- Main screen with Morning, Lunch, and Dinner request cards
- Cute multi-step dinner flow with animated hearts and success confetti
- Telegram notification support
- Required final voice-note step with a 1-60 minute arrival dial
- Telegram-only submission flow, with no database required
- Admin editor at `/admin` for changing meal cards and form answer choices

## Run Locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Environment Variables

Copy `.env.example` to `.env.local` and fill in what you need.

```bash
TELEGRAM_BOT_TOKEN=
TELEGRAM_CHAT_ID=
ADMIN_PASSWORD=
```

Submissions return success only when Telegram accepts the message.
`ADMIN_PASSWORD` protects `/admin`. Local admin changes are saved to `.data/form-config.json`.

## Telegram Setup

1. Message `@BotFather` in Telegram.
2. Create a bot with `/newbot`.
3. Put the returned token in `TELEGRAM_BOT_TOKEN`.
4. Send a message to your bot.
5. Get your chat ID from `https://api.telegram.org/botYOUR_TOKEN/getUpdates`.
6. Put that ID in `TELEGRAM_CHAT_ID`.

When a choice is submitted, the app UI can be Vietnamese or English, but Telegram notifications are always sent in English.
The final step requires a recorded voice note and an arrival time before the app can submit.

## Admin Editor

Open `/admin`, enter `ADMIN_PASSWORD`, and edit:

- Morning, Lunch, and Dinner card titles/subtitles
- Food choices
- How-to-eat choices
- Mood choices

The local/server file storage approach is fine for local development and a persistent Node server. On Vercel, filesystem changes made from `/admin` are not durable, so use the admin editor locally before deploying or add persistent storage later.

## Deploy To Vercel

1. Push the project to GitHub.
2. Import it in Vercel.
3. Add `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`, and `ADMIN_PASSWORD` in Vercel project settings.
4. Deploy.

## Building Budget App

The standalone house-build budget app lives in `public/building`.
After deploying to Vercel, open it at `/building`.
