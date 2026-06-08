// ============================================================
//  config.js  –  Auth + HTTP client
//  ⚠ NO uses import/export: se carga como script clásico
// ============================================================

const API_BASE_URL = 'http://localhost:8080';

const ENDPOINTS = {
  aulas:          `${API_BASE_URL}/api/aulas`,
  avisos:         `${API_BASE_URL}/api/avisos`,
  materias:       `${API_BASE_URL}/api/materias`,
  profesorMateria:`${API_BASE_URL}/api/profesorMateria`,
  reservas:       `${API_BASE_URL}/api/reservas`,
  usuarios:       `${API_BASE_URL}/api/usuarios`,
};

// ── AuthService ───────────────────────────────────────────────
const AuthService = {
  SESSION_KEY: 'aulas_session',

  /**
   * Intenta login contra el backend real.
   * Usa GET /api/aulas como "ping" autenticado para validar credenciales.
   * Si el servidor responde 401 → credenciales inválidas.
   */
  async login(username, password) {
    // 1. Armar el token Basic
    const token = btoa(`${username}:${password}`);

    // 2. Validar contra el backend (cualquier endpoint protegido sirve)
    const response = await fetch(`${API_BASE_URL}/api/aulas`, {
      headers: {
        'Authorization': `Basic ${token}`,
        'Content-Type':  'application/json',
      }
    });

    if (response.status === 401 || response.status === 403) {
      throw new Error('Usuario o contraseña incorrectos.');
    }
    if (!response.ok) {
      throw new Error(`Error del servidor (${response.status}). Intentá de nuevo.`);
    }

    // 3. Determinar rol según el usuario (alineado con SecurityConfig.java)
    const roleMap = { profe: 'ADMIN', alumno: 'USER' };
    const role = roleMap[username] || 'USER';

    // 4. Persistir sesión en sessionStorage
    const session = { username, role, token };
    sessionStorage.setItem(this.SESSION_KEY, JSON.stringify(session));
    return session;
  },

  logout() {
    sessionStorage.removeItem(this.SESSION_KEY);
  },

  getSession() {
    try {
      return JSON.parse(sessionStorage.getItem(this.SESSION_KEY));
    } catch {
      return null;
    }
  },

  isAuthenticated() {
    return !!this.getSession();
  },

  isAdmin() {
    return this.getSession()?.role === 'ADMIN';
  },

  /** Devuelve el objeto de headers con Authorization listo para fetch */
  getAuthHeader() {
    const session = this.getSession();
    if (!session) return {};
    return { 'Authorization': `Basic ${session.token}` };
  },
};

// ── HTTP Client ───────────────────────────────────────────────
const http = {
  async _request(url, options = {}) {
    const headers = {
      'Content-Type': 'application/json',
      ...AuthService.getAuthHeader(),   // ← se adjunta en CADA petición
      ...(options.headers || {}),
    };

    const response = await fetch(url, { ...options, headers });

    // Sesión expirada o credenciales revocadas
    if (response.status === 401) {
      AuthService.logout();
      App.showLogin();
      throw new Error('Sesión expirada. Iniciá sesión nuevamente.');
    }

    if (response.status === 403) {
      throw new Error('No tenés permisos para realizar esta acción.');
    }

    if (!response.ok) {
      const msg = await response.text().catch(() => '');
      throw new Error(msg || `Error HTTP ${response.status}`);
    }

    const text = await response.