const STORAGE_KEY = "fp-email-verification";
const CODE_VALID_MS = 10 * 60 * 1000;

export const savePendingVerification = (email) =>
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ email, sentAt: Date.now(), dismissed: false })
  );

export const clearPendingVerification = () => localStorage.removeItem(STORAGE_KEY);

export const getPendingVerification = (email) => {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (saved && saved.email === email && Date.now() - saved.sentAt < CODE_VALID_MS) {
      return saved;
    }
  } catch {
    // Ignore malformed local storage data.
  }
  return null;
};

export const dismissPendingVerification = () => {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (saved) {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ ...saved, dismissed: true })
      );
    }
  } catch {
    // Ignore malformed local storage data.
  }
};