import { createClient } from '@base44/sdk';
import { appParams } from '@/lib/app-params';

const { appId, token, functionsVersion, appBaseUrl } = appParams;

const hasBase44Config = Boolean(appId && appBaseUrl);

const STORAGE_KEY = 'resonance_local_base44';

const nowIso = () => new Date().toISOString();
const newId = (prefix) => `${prefix}_${crypto.randomUUID?.() || Math.random().toString(36).slice(2)}`;

const DEFAULT_USER = {
  id: 'local_user',
  email: 'local@resonance.app',
  role: 'user',
  full_name: 'Local User'
};

function readDb() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const db = JSON.parse(raw);
      if (db.currentUser?.id === DEFAULT_USER.id) {
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
        return db.currentUser;
      },

      async loginViaEmailPassword(email) {
        const db = readDb();
        let user = db.users.find((item) => item.email === email);
        if (!user) {
          user = { id: newId('user'), email, role: 'user', full_name: email.split('@')[0] };
          db.users.push(user);
        }
        db.currentUser = user;
        writeDb(db);
        return { access_token: `local_${user.id}` };
      },

      async register({ email }) {
        const db = readDb();
        if (!db.users.some((item) => item.email === email)) {
          db.users.push({ id: newId('user'), email, role: 'user', full_name: email.split('@')[0] });
          writeDb(db);
        }
        return { ok: true };
      },

      async verifyOtp({ email }) {
        return this.loginViaEmailPassword(email);
      },

      async resendOtp() {
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
