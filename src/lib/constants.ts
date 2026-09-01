// ----------------------------------------------------------------------------
// Job categories
// Edit this list to add, remove, or rename categories shown in the "post a
// job" form and the browse/filter dropdown. No database migration needed -
// categories are stored as plain text on each job row.
// ----------------------------------------------------------------------------
export const JOB_CATEGORIES = [
  "Content Writing",
  "Social Media",
  "Development",
  "Design",
  "Translation",
  "Data Entry",
  "Marketing",
  "Video Editing",
  "Other",
] as const;

export type JobCategory = (typeof JOB_CATEGORIES)[number];

// ----------------------------------------------------------------------------
// Telegram contacts
// Shown as a "Contact on Telegram" button on job details. Edit the URL
// below to point at your own support/ops handle, or change how it's built
// per-job in src/components/telegram-button.tsx if you want it to vary.
// ----------------------------------------------------------------------------
export const TELEGRAM_SUPPORT_HANDLE = "gigboard_support";
export const TELEGRAM_SUPPORT_URL = `https://t.me/${TELEGRAM_SUPPORT_HANDLE}`;

// Builds a Telegram deep link out of a contact a client entered when
// posting a job. Accepts "@handle", "handle", or a full t.me URL.
export function buildTelegramUrl(contact: string): string {
  const trimmed = contact.trim();
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }
  const handle = trimmed.replace(/^@/, "");
  return `https://t.me/${handle}`;
}

export const CURRENCIES = ["USD", "EUR", "GBP"] as const;
