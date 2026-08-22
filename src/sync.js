import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { db, isFirebaseConfigured, ensureAnonAuth } from './firebase.js';
import { exportAllData, importAllData } from './store.js';

const SYNC_CODE_KEY = 'cloo_sync_code';
const PUSH_DEBOUNCE_MS = 1200;

let pushTimer = null;
let lastPushedAt = 0;

export function isSyncAvailable() {
  return isFirebaseConfigured;
}

export function getSyncCode() {
  return localStorage.getItem(SYNC_CODE_KEY) || '';
}

export function setSyncCode(code) {
  localStorage.setItem(SYNC_CODE_KEY, code);
}

export function clearSyncCode() {
  localStorage.removeItem(SYNC_CODE_KEY);
}

// Human-friendly random code, e.g. "loo-8f2k9x"
export function generateSyncCode() {
  const part = () => Math.random().toString(36).slice(2, 8);
  return `loo-${part()}`;
}

async function getSyncDocRef(code) {
  await ensureAnonAuth();
  return doc(db, 'syncs', code);
}

export async function pushToCloud(code) {
  if (!isFirebaseConfigured || !code) return;
  const ref = await getSyncDocRef(code);
  lastPushedAt = Date.now();
  await setDoc(ref, { ...exportAllData(), updatedAt: lastPushedAt });
}

// Debounced push — call after any local data mutation
export function schedulePush() {
  const code = getSyncCode();
  if (!isFirebaseConfigured || !code) return;
  if (pushTimer) clearTimeout(pushTimer);
  pushTimer = setTimeout(() => {
    pushToCloud(code).catch(() => {});
  }, PUSH_DEBOUNCE_MS);
}

export async function pullFromCloud(code) {
  if (!isFirebaseConfigured || !code) return null;
  const ref = await getSyncDocRef(code);
  const snap = await getDoc(ref);
  return snap.exists() ? snap.data() : null;
}

// Subscribes to remote changes; onRemoteData is skipped for our own echoed writes
export function subscribeToCloud(code, onRemoteData) {
  if (!isFirebaseConfigured || !code) return () => {};
  let unsub = () => {};
  let cancelled = false;
  getSyncDocRef(code).then(ref => {
    if (cancelled) return;
    unsub = onSnapshot(ref, snap => {
      if (!snap.exists()) return;
      const data = snap.data();
      if (data.updatedAt && data.updatedAt === lastPushedAt) return;
      onRemoteData(data);
    });
  });
  return () => { cancelled = true; unsub(); };
}

// Links this device to a code: merges with whatever already exists in the cloud
export async function linkSyncCode(code) {
  const remote = await pullFromCloud(code);
  if (remote) {
    importAllData(remote);
  }
  setSyncCode(code);
  if (!remote) {
    await pushToCloud(code);
  }
  return remote;
}

export function unlinkSyncCode() {
  clearSyncCode();
  lastPushedAt = 0;
}
