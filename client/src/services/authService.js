import { apiRequest } from './api';

const USER_STORAGE_KEY = 'user';
const TOKEN_STORAGE_KEY = 'token';

export const authService = {
  getCurrentUser() {
    try {
      const raw = localStorage.getItem(USER_STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  async login({ identifiant, email, password }) {
    const loginEmail = (email || identifiant || '').trim();
    const data = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: loginEmail, password }),
    });

    localStorage.setItem(TOKEN_STORAGE_KEY, data.token);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(data.user));
    window.dispatchEvent(new Event('dossicom:auth-updated'));
    window.dispatchEvent(new Event('dossicom:db-updated'));
    return data.user;
  },

  async registerPatient(formData) {
    const fullName =
      formData.name?.trim() ||
      `${formData.prenom || ''} ${formData.nom || ''}`.trim();

    const data = await apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        name: fullName,
        email: formData.email?.trim(),
        password: formData.password,
        role: 'patient',
      }),
    });

    localStorage.setItem(TOKEN_STORAGE_KEY, data.token);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(data.user));
    window.dispatchEvent(new Event('dossicom:auth-updated'));
    window.dispatchEvent(new Event('dossicom:db-updated'));
    return data.user;
  },

  logout() {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(USER_STORAGE_KEY);
    window.dispatchEvent(new Event('dossicom:auth-updated'));
  },
};