// ============================================================
//  config.js  –  Auth + HTTP client
//  ⚠ NO uses import/export: se carga como script clásico
// ============================================================

const API_BASE_URL = 'http://localhost:8080';

const ENDPOINTS = {
    aulas:      `${API_BASE_URL}/api/aulas`,
    avisos:     `${API_BASE_URL}/api/avisos`,
    materias:   `${API_BASE_URL}/api/materias`,
    comisiones: `${API_BASE_URL}/api/comision`,
    reservas:   `${API_BASE_URL}/api/reservas`,
    usuarios:   `${API_BASE_URL}/api/usuarios`,
};

// ── AuthService ───────────────────────────────────────────────
const AuthService = {
  SESSION_KEY: 'aulas_session',

  /**
   * Valida las credenciales contra el backend usando HTTP Basic.
   * Llama a GET /api/aulas como ping autenticado.
   * - 200 OK  → credenciales correctas
   * - 401/403 → credenciales incorrectas o sin permisos
   */
  async login(username, password) {
    // 1. Codificar las credenciales en Base64
    const token = btoa(`${username}:${password}`);

    // 2. Hacer una petición de prueba al backend con el header Authorization
    //    Usamos /api/aulas porque es accesible por todos los roles autenticados
    const response = await fetch(`${API_BASE_URL}/api/aulas`, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${token}`,
        'Content-Type':  'application/json',
      },
    });

    if (response.status === 401) {
      throw new Error('Usuario o contraseña incorrectos.');
    }
    if (response.status === 403) {
      throw new Error('No tenés permisos para acceder.');
    }
    if (!response.ok) {
      throw new Error(`Error del servidor (${response.status}). Intentá de nuevo.`);
    }

    // 3. Determinar el rol a partir del username
    //    DEBE coincidir exactamente con los usuarios de SecurityConfig.java:
    //      "alumno"  → ROLE_ALUMNO
    //      "profesor"→ ROLE_PROFESOR
    //      "admin"   → ROLE_ADMIN
    const roleMap = {
      alumno:   'ALUMNO',
      profesor: 'PROFESOR',
      admin:    'ADMIN',
    };
    const role = roleMap[username] || 'ALUMNO';

    // 4. Guardar la sesión en sessionStorage
    //    (se borra automáticamente al cerrar la pestaña)
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

  isProfesor() {
    // ADMIN hereda PROFESOR y ALUMNO según la jerarquía de roles configurada
    const role = this.getSession()?.role;
    return role === 'PROFESOR' || role === 'ADMIN';
  },

  /** Headers con Authorization listos para adjuntar a cada fetch */
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
      ...AuthService.getAuthHeader(),        // ← se adjunta en CADA petición
      ...(options.headers || {}),
    };

    const response = await fetch(url, { ...options, headers });

    // Sesión expirada o revocada
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

    // 204 No Content (respuestas de DELETE) → no hay body que parsear
    if (response.status === 204) return null;

    // Intentar parsear como JSON; si el body está vacío devolver null
    const text = await response.text();
    return text ? JSON.parse(text) : null;
  },

  get(url)           { return this._request(url, { method: 'GET' }); },
  post(url, body)    { return this._request(url, { method: 'POST',   body: JSON.stringify(body) }); },
  put(url, body)     { return this._request(url, { method: 'PUT',    body: JSON.stringify(body) }); },
  delete(url)        { return this._request(url, { method: 'DELETE' }); },
};