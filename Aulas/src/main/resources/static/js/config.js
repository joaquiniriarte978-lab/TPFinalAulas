// ============================================================
//  api/config.js  –  Configuración central de la API
// ============================================================

export const API_BASE_URL = 'http://localhost:8080';

export const ENDPOINTS = {
  aulas:          `${API_BASE_URL}/api/aulas`,
  avisos:         `${API_BASE_URL}/api/avisos`,
  materias:       `${API_BASE_URL}/api/materias`,
  profesorMateria:`${API_BASE_URL}/api/profesorMateria`,
  reservas:       `${API_BASE_URL}/api/reservas`,
  usuarios:       `${API_BASE_URL}/api/usuarios`,
};

// ============================================================
//  AUTH – HTTP Basic Auth con roles ADMIN / USER
// ============================================================

const AUTH_KEY = 'aulas_session';

export const AuthService = {
  /** Credenciales válidas definidas en SecurityConfig.java */
  USERS: [
    { username: 'profe',  password: 'admin123', role: 'ADMIN', displayName: 'Profesor Admin' },
    { username: 'alumno', password: '1234',     role: 'USER',  displayName: 'Alumno'         },
  ],

  login(username, password) {
    const user = this.USERS.find(
      u => u.username === username && u.password === password
    );
    if (!user) throw new Error('Credenciales incorrectas');

    const session = {
      username:    user.username,
      role:        user.role,
      displayName: user.displayName,
      token:       btoa(`${username}:${password}`),   // Basic Auth header
    };
    sessionStorage.setItem(AUTH_KEY, JSON.stringify(session));
    return session;
  },

  logout() {
    sessionStorage.removeItem(AUTH_KEY);
    window.location.hash = '#login';
  },

  getSession() {
    const raw = sessionStorage.getItem(AUTH_KEY);
    return raw ? JSON.parse(raw) : null;
  },

  isAuthenticated() {
    return !!this.getSession();
  },

  isAdmin() {
    return this.getSession()?.role === 'ADMIN';
  },

  getAuthHeader() {
    const session = this.getSession();
    if (!session) return {};
    return { Authorization: `Basic ${session.token}` };
  },
};

// ============================================================
//  HTTP CLIENT – Wrapper de fetch con auth y manejo de errores
// ============================================================

async function request(url, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...AuthService.getAuthHeader(),
    ...(options.headers || {}),
  };

  const response = await fetch(url, { ...options, headers });

  if (response.status === 401) {
    AuthService.logout();
    throw new Error('Sesión expirada. Por favor iniciá sesión nuevamente.');
  }
  if (response.status === 403) {
    throw new Error('No tenés permisos para realizar esta acción.');
  }
  if (!response.ok) {
    const msg = await response.text().catch(() => 'Error desconocido');
    throw new Error(msg || `Error HTTP ${response.status}`);
  }

  const text = await response.text();
  return text ? JSON.parse(text) : null;
}

export const http = {
  get:    (url)           => request(url),
  post:   (url, body)     => request(url, { method: 'POST',   body: JSON.stringify(body) }),
  put:    (url, body)     => request(url, { method: 'PUT',    body: JSON.stringify(body) }),
  delete: (url)           => request(url, { method: 'DELETE' }),
};
