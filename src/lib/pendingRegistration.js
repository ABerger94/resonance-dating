const PENDING_REGISTRATION_KEY = 'resonance_pending_registration';

export function savePendingRegistration(credentials) {
  sessionStorage.setItem(PENDING_REGISTRATION_KEY, JSON.stringify({
    email: String(credentials.email || '').trim().toLowerCase(),
    password: credentials.password || ''
  }));
}

export function loadPendingRegistration() {
  try {
    const raw = sessionStorage.getItem(PENDING_REGISTRATION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function clearPendingRegistration() {
  sessionStorage.removeItem(PENDING_REGISTRATION_KEY);
}
