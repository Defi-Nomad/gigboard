import { buildTelegramUrl } from "@/lib/constants";

export function TelegramButton({ contact }: { contact: string }) {
  return (
    <a
      href={buildTelegramUrl(contact)}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 rounded-sm border border-[#2AABEE]/40 bg-[#2AABEE]/10 px-4 py-2.5 text-sm font-medium text-[#2AABEE] transition-colors hover:bg-[#2AABEE]/20"
    >
      <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">
        <path d="M21.94 4.6c.24-1-.72-1.8-1.63-1.44L2.4 10.32c-1.02.4-1 1.88.03 2.24l4.4 1.53 1.7 5.5c.24.78 1.24.98 1.79.36l2.52-2.83 4.55 3.36c.75.55 1.83.14 2.03-.77L21.94 4.6ZM8.4 13.6l9.03-6.6c.2-.14.42.12.24.3l-7.4 6.9-.3 3.3-1.57-3.9Z" />
      </svg>
      Contact on Telegram
    </a>
  );
}
