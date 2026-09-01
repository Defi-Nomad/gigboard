// X (Twitter) profile URL validation, shared by the client-side form and
// the server action so neither can be bypassed.
const X_PROFILE_REGEX =
  /^https?:\/\/(www\.)?(x\.com|twitter\.com)\/[a-zA-Z0-9_]{1,15}\/?$/;

export function isValidXProfileUrl(url: string): boolean {
  return X_PROFILE_REGEX.test(url.trim());
}

export function validateJobInput(input: {
  title: string;
  description: string;
  category: string;
  budgetAmount: number;
  telegramContact: string;
}): string | null {
  if (input.title.trim().length < 3 || input.title.trim().length > 120) {
    return "Title must be between 3 and 120 characters.";
  }
  if (input.description.trim().length < 10 || input.description.trim().length > 5000) {
    return "Description must be between 10 and 5000 characters.";
  }
  if (!input.category) {
    return "Choose a category.";
  }
  if (!Number.isFinite(input.budgetAmount) || input.budgetAmount < 0) {
    return "Budget must be a positive number.";
  }
  if (!input.telegramContact.trim()) {
    return "A Telegram contact is required so workers can reach you.";
  }
  return null;
}

export function validateApplicationInput(input: {
  xProfileUrl: string;
  coverMessage: string;
}): string | null {
  if (!isValidXProfileUrl(input.xProfileUrl)) {
    return "Enter a valid X profile URL, e.g. https://x.com/yourhandle";
  }
  if (input.coverMessage.trim().length < 10 || input.coverMessage.trim().length > 2000) {
    return "Message must be between 10 and 2000 characters.";
  }
  return null;
}
