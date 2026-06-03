import { createClient } from '@base44/sdk';
import { appParams } from '@/lib/app-params';

const { appId, token, functionsVersion, appBaseUrl } = appParams;

const hasBase44Config = Boolean(appId && appBaseUrl);

const STORAGE_KEY = 'resonance_local_base44';

const nowIso = () => new Date().toISOString();
const newId = (prefix) => `${prefix}_${crypto.randomUUID?.() || Math.random().toString(36).slice(2)}`;
const normalizeEmail = (email) => String(email || '').trim().toLowerCase();
const publicUser = (user) => {
  if (!user) return null;
  const { password, verification_code, verification_expires_at, ...safeUser } = user;
  return safeUser;
};

function generateVerificationCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

async function sendVerificationEmail(email, code) {
  const response = await fetch('/api/send-verification-email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, code })
  });
  if (!response.ok) {
    let message = 'Could not send verification code.';
    try {
      const body = await response.json();
      message = body.error || message;
    } catch {
      // Keep the default message.
    }
    throw new Error(message);
  }
}

const DEFAULT_USER = {
  id: 'local_user',
  email: 'local@resonance.app',
  role: 'user',
  full_name: 'Local User',
  email_verified: false
};

function readDb() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const db = JSON.parse(raw);
      if (db.currentUser?.id === DEFAULT_USER.id) {
        db.currentUser = null;
      }
      if (db.currentUser?.email_verified !== true) {
        db.currentUser = null;
      }
      return db;
    }
  } catch {
    // Fall through to a clean local store.
  }

  return {
    currentUser: null,
    users: [DEFAULT_USER],
    entities: {
      UserProfile: [],
      PrivateProfile: [],
      Thread: [],
      Interaction: []
    }
  };
}

function writeDb(db) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  return db;
}

function sortRecords(records, sort) {
  if (!sort) return records;
  const direction = sort.startsWith('-') ? -1 : 1;
  const key = sort.replace(/^-/, '');
  return [...records].sort((a, b) => {
    const av = a[key] || '';
    const bv = b[key] || '';
    return av > bv ? direction : av < bv ? -direction : 0;
  });
}

function matchesQuery(record, query = {}) {
  return Object.entries(query).every(([key, value]) => record[key] === value);
}

function createEntityApi(name) {
  return {
    async filter(query = {}, sort, limit) {
      const db = readDb();
      const records = db.entities[name] || [];
      const filtered = sortRecords(records.filter((record) => matchesQuery(record, query)), sort);
      return typeof limit === 'number' ? filtered.slice(0, limit) : filtered;
    },

    async get(id) {
      const db = readDb();
      const record = (db.entities[name] || []).find((item) => item.id === id);
      if (!record) throw new Error(`${name} not found`);
      return record;
    },

    async create(data) {
      const db = readDb();
      const collection = db.entities[name] || [];
      const timestamp = nowIso();
      const record = {
        ...data,
        id: data.id || newId(name.toLowerCase()),
        created_date: data.created_date || timestamp,
        updated_date: timestamp
      };
      db.entities[name] = [...collection, record];
      writeDb(db);
      return record;
    },

    async update(id, data) {
      const db = readDb();
      const collection = db.entities[name] || [];
      const index = collection.findIndex((item) => item.id === id);
      if (index === -1) throw new Error(`${name} not found`);
      const record = {
        ...collection[index],
        ...data,
        id,
        updated_date: nowIso()
      };
      collection[index] = record;
      db.entities[name] = collection;
      writeDb(db);
      return record;
    },

    async delete(id) {
      const db = readDb();
      db.entities[name] = (db.entities[name] || []).filter((item) => item.id !== id);
      writeDb(db);
      return true;
    }
  };
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error || new Error('File upload failed'));
    reader.readAsDataURL(file);
  });
}

function createStandaloneClient() {
  return {
    isStandalone: true,
    auth: {
      async me() {
        const db = readDb();
        if (!db.currentUser) {
          const error = new Error('Authentication required');
          error.status = 401;
          throw error;
        }
        if (db.currentUser.email_verified !== true) {
          db.currentUser = null;
          writeDb(db);
          const error = new Error('Email verification required');
          error.status = 403;
          error.code = 'email_not_verified';
          throw error;
        }
        return db.currentUser;
      },

      async loginViaEmailPassword(email, password) {
        const db = readDb();
        const normalizedEmail = normalizeEmail(email);
        const user = db.users.find((item) => item.email === normalizedEmail);
        if (!user || (user.password && user.password !== password)) {
          const error = new Error('Invalid email or password');
          error.status = 401;
          throw error;
        }
        if (user.email_verified !== true) {
          const error = new Error('Verify your email before logging in.');
          error.status = 403;
          error.code = 'email_not_verified';
          throw error;
        }
        db.currentUser = publicUser(user);
        writeDb(db);
        return { access_token: `local_${user.id}` };
      },

      async register({ email, password }) {
        const db = readDb();
        const normalizedEmail = normalizeEmail(email);
        const verificationCode = generateVerificationCode();
        const verificationExpiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();
        const existingIndex = db.users.findIndex((item) => item.email === normalizedEmail);
        const user = {
          ...(existingIndex >= 0 ? db.users[existingIndex] : {}),
          id: existingIndex >= 0 ? db.users[existingIndex].id : newId('user'),
          email: normalizedEmail,
          password,
          role: existingIndex >= 0 ? db.users[existingIndex].role : 'user',
          full_name: normalizedEmail.split('@')[0],
          email_verified: false,
          verification_code: verificationCode,
          verification_expires_at: verificationExpiresAt
        };
        if (existingIndex >= 0) {
          db.users[existingIndex] = user;
        } else {
          db.users.push(user);
        }
        db.currentUser = null;
        writeDb(db);
        await sendVerificationEmail(normalizedEmail, verificationCode);
        return { ok: true, verification_required: true };
      },

      async verifyOtp({ email, otpCode }) {
        const db = readDb();
        const normalizedEmail = normalizeEmail(email);
        const userIndex = db.users.findIndex((item) => item.email === normalizedEmail);
        const user = db.users[userIndex];
        if (!user) {
          const error = new Error('Account not found');
          error.status = 404;
          throw error;
        }
        if (user.verification_code !== String(otpCode || '').trim()) {
          const error = new Error('Invalid verification code');
          error.status = 400;
          throw error;
        }
        if (Date.parse(user.verification_expires_at || '') < Date.now()) {
          const error = new Error('Verification code expired');
          error.status = 400;
          throw error;
        }
        const verifiedUser = {
          ...user,
          email_verified: true,
          verification_code: undefined,
          verification_expires_at: undefined
        };
        db.users[userIndex] = verifiedUser;
        db.currentUser = publicUser(verifiedUser);
        writeDb(db);
        return { access_token: `local_${verifiedUser.id}` };
      },

      async resendOtp(email) {
        const db = readDb();
        const normalizedEmail = normalizeEmail(email);
        const userIndex = db.users.findIndex((item) => item.email === normalizedEmail);
        if (userIndex === -1) {
          const error = new Error('Account not found');
          error.status = 404;
          throw error;
        }
        const verificationCode = generateVerificationCode();
        db.users[userIndex] = {
          ...db.users[userIndex],
          email_verified: false,
          verification_code: verificationCode,
          verification_expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString()
        };
        writeDb(db);
        await sendVerificationEmail(normalizedEmail, verificationCode);
        return { ok: true };
      },

      async resetPasswordRequest() {
        return { ok: true };
      },

      async resetPassword() {
        return { ok: true };
      },

      setToken() {},

      loginWithProvider() {
        window.location.href = '/login';
      },

      logout(redirectTo = '/login') {
        const db = readDb();
        db.currentUser = null;
        writeDb(db);
        if (redirectTo) window.location.href = redirectTo;
      },

      redirectToLogin() {
        window.location.href = '/login';
      }
    },
    entities: {
      UserProfile: createEntityApi('UserProfile'),
      PrivateProfile: createEntityApi('PrivateProfile'),
      Thread: createEntityApi('Thread'),
      Interaction: createEntityApi('Interaction')
    },
    integrations: {
      Core: {
        async UploadFile({ file }) {
          return { file_url: await fileToDataUrl(file) };
        }
      }
    }
  };
}

export const base44 = hasBase44Config
  ? createClient({
      appId,
      token,
      functionsVersion,
      serverUrl: '',
      requiresAuth: true,
      appBaseUrl
    })
  : createStandaloneClient();
