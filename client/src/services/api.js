import { INITIAL_DB } from '../data/mockData';

export const USE_MOCK = false;
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const DB_STORAGE_KEY = 'dossicom_db_v1';

export function getLocalDB() {
  try {
    const raw = localStorage.getItem(DB_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(DB_STORAGE_KEY, JSON.stringify(INITIAL_DB));
      return structuredClone(INITIAL_DB);
    }
    return JSON.parse(raw);
  } catch {
    return structuredClone(INITIAL_DB);
  }
}

export function saveLocalDB(nextDb) {
  localStorage.setItem(DB_STORAGE_KEY, JSON.stringify(nextDb));
  window.dispatchEvent(new Event('dossicom:db-updated'));
}

export function resetLocalDB() {
  localStorage.setItem(DB_STORAGE_KEY, JSON.stringify(INITIAL_DB));
  window.dispatchEvent(new Event('dossicom:db-updated'));
  return structuredClone(INITIAL_DB);
}

export async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.message || `Erreur serveur (${response.status})`);
  }

  return response.json();
}

export default {
  USE_MOCK,
  API_BASE_URL,
  getLocalDB,
  saveLocalDB,
  resetLocalDB,
  apiRequest,
};