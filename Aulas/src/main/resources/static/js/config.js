
const API_BASE_URL = 'http://localhost:8080';

const ENDPOINTS = {
    aulas:      `${API_BASE_URL}/api/aulas`,
    avisos:     `${API_BASE_URL}/api/avisos`,
    materias:   `${API_BASE_URL}/api/materias`,
    comisiones: `${API_BASE_URL}/api/comision`,
    reservas:   `${API_BASE_URL}/api/reservas`,
    usuarios:   `${API_BASE_URL}/api/usuarios`,
};

const AuthService = {
  SESSION_KEY: 'aulas_session',


  async login(username, password) {
    const token = btoa(`${username}:${password}`);


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


    const perfilResponse = await fetch(`${API_BASE_URL}/api/usuarios/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!perfilResponse.ok) {
      throw new Error('No se pudo obtener el perfil del usuario.');
    }

    const perfil = await perfilResponse.json();

    const session = {
      username: perfil.nombre || username,
      email: perfil.email,
      role: perfil.rol,
      token,
    };

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

const http = {

  async _request(url, options = {}) {
    const headers = {
      'Content-Type': 'application/json',
      ...AuthService.getAuthHeader(),
      ...(options.headers || {}),
    };

    const response = await fetch(url, { ...options, headers });

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

    if (response.status === 204) return null;

    const text = await response.text();
    return text ? JSON.parse(text) : null;
  },

  get(url)           { return this._request(url, { method: 'GET' }); },
  post(url, body)    { return this._request(url, { method: 'POST',   body: JSON.stringify(body) }); },
  put(url, body)     { return this._request(url, { method: 'PUT',    body: JSON.stringify(body) }); },
  delete(url)        { return this._request(url, { method: 'DELETE' }); },
};