// ============================================================
//  ui.js  –  Lógica de UI + punto de entrada
//  Depende de: config.js, services.js
// ============================================================

// ── TOAST ─────────────────────────────────────────────────────
const Toast = {
  _icons: { success: '✓', error: '✕', info: 'ℹ', warning: '⚠' },

  show(message, type = 'info', duration = 3500) {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const el = document.createElement('div');
    el.className = `toast ${type}`;
    el.innerHTML = `
      <span style="font-size:1rem">${this._icons[type]}</span>
      <span>${message}</span>`;
    container.appendChild(el);
    setTimeout(() => {
      el.style.animation = 'slideOut .3s forwards';
      setTimeout(() => el.remove(), 300);
    }, duration);
  },

  success: (m) => Toast.show(m, 'success'),
  error:   (m) => Toast.show(m, 'error'),
  info:    (m) => Toast.show(m, 'info'),
  warning: (m) => Toast.show(m, 'warning'),
};

// ── HELPERS ───────────────────────────────────────────────────
function setLoading(container) {
  container.innerHTML = '<div class="spinner-wrap"><div class="spinner"></div></div>';
}

function emptyState(icon, title, sub = '') {
  return `<div class="empty-state">
    <div class="empty-icon">${icon}</div>
    <h3>${title}</h3>
    ${sub ? `<p>${sub}</p>` : ''}
  </div>`;
}

// ── APP (objeto global accesible desde el HTML) ───────────────
const App = {

  showLogin() {
    document.getElementById('page-login').style.display = 'flex';
    document.getElementById('page-app').style.display   = 'none';
  },

  showApp() {
    document.getElementById('page-login').style.display = 'none';
    document.getElementById('page-app').style.display   = 'block';

    const session = AuthService.getSession();
    if (session) {
      document.getElementById('user-name').textContent   = session.username;
      document.getElementById('user-role').textContent   = session.role;
      document.getElementById('user-avatar').textContent = session.username[0].toUpperCase();

      // Mostrar/ocultar ítems de nav según el rol
      this._applyRoleVisibility(session.role);
    }

    this.navigate('aulas');
  },

  /**
   * Oculta secciones del menú lateral que el rol actual no puede ver.
   * Se basa en la jerarquía de SecurityConfig.java:
   *   ADMIN  > PROFESOR > ALUMNO
   */
  _applyRoleVisibility(role) {
    const adminOnly  = ['usuarios', 'comision'];
    const profeAndUp = ['reservas', 'avisos'];

    document.querySelectorAll('.nav-item[data-section]').forEach(btn => {
      const section = btn.dataset.section;
      if (adminOnly.includes(section) && role !== 'ADMIN') {
        btn.style.display = 'none';
      } else if (profeAndUp.includes(section) && role === 'ALUMNO') {
        btn.style.display = 'none';
      } else {
        btn.style.display = '';
      }
    });
  },

  /** Rellena el formulario de login con credenciales de demo */
  fillLogin(user, pass) {
    document.getElementById('login-user').value = user;
    document.getElementById('login-pass').value = pass;
  },

  /** Navega entre secciones del panel principal */
  navigate(section) {
    document.querySelectorAll('.nav-item').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.section === section);
    });

    const titles = {
      aulas:   'Aulas',
      materias:'Materias',
      reservas:'Reservas',
      avisos:  'Avisos',
      usuarios:'Usuarios',
      comision:'Profesor–Materia',    // ← coincide con data-section="comision" del HTML
    };
    document.getElementById('topbar-title').textContent = titles[section] || section;

    const body = document.getElementById('page-body');
    switch (section) {
      case 'aulas':    Views.aulas(body);    break;
      case 'materias': Views.materias(body); break;
      case 'reservas': Views.reservas(body); break;
      case 'avisos':   Views.avisos(body);   break;
      case 'usuarios': Views.usuarios(body); break;
      case 'comision': Views.comision(body); break;    // ← antes era 'profesorMateria'
      default:         body.innerHTML = '<p>Sección no encontrada.</p>';
    }
  },

  // ── Inicialización ─────────────────────────────────────────
  init() {
    if (AuthService.isAuthenticated()) {
      this.showApp();
    } else {
      this.showLogin();
    }

    // ── Botón de login ──────────────────────────────────────
    // FIX: este addEventListener faltaba en la versión anterior,
    //      por eso el botón no hacía nada al hacer clic.
    document.getElementById('btn-login')
      .addEventListener('click', () => this._handleLogin());

    // También permitir enviar con Enter desde los inputs
    ['login-user', 'login-pass'].forEach(id => {
      document.getElementById(id)
        .addEventListener('keydown', e => {
          if (e.key === 'Enter') this._handleLogin();
        });
    });

    // Botón logout
    document.getElementById('btn-logout').addEventListener('click', () => {
      AuthService.logout();
      this.showLogin();
      Toast.info('Sesión cerrada.');
    });

    // Navegación sidebar
    document.querySelectorAll('.nav-item[data-section]').forEach(btn => {
      btn.addEventListener('click', () => this.navigate(btn.dataset.section));
    });

    // Hamburger (mobile)
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    document.getElementById('hamburger').addEventListener('click', () => {
      sidebar.classList.toggle('open');
      overlay.classList.toggle('visible');
    });
    overlay.addEventListener('click', () => {
      sidebar.classList.remove('open');
      overlay.classList.remove('visible');
    });
  },

  // ── Lógica de login ────────────────────────────────────────
  async _handleLogin() {
    const username = document.getElementById('login-user').value.trim();
    const password = document.getElementById('login-pass').value;
    const errorEl  = document.getElementById('login-error');
    const btnLogin = document.getElementById('btn-login');

    errorEl.style.display = 'none';

    if (!username || !password) {
      errorEl.textContent   = 'Completá usuario y contraseña.';
      errorEl.style.display = 'block';
      return;
    }

    btnLogin.disabled    = true;
    btnLogin.textContent = 'Verificando…';

    try {
      await AuthService.login(username, password);
      this.showApp();
      Toast.success(`¡Bienvenido, ${username}!`);
    } catch (err) {
      errorEl.textContent   = err.message;
      errorEl.style.display = 'block';
    } finally {
      btnLogin.disabled    = false;
      btnLogin.textContent = 'Iniciar sesión';
    }
  },
};

// ── VISTAS (stubs — Fase 2 completará el render real) ─────────
const Views = {
  async aulas(container) {
    setLoading(container);
    try {
      const data = await AulaService.listar();
      container.innerHTML = `<p style="color:var(--clr-subtle)">
        ✅ ${data.length} aulas cargadas. (Vista completa en Fase 2)</p>`;
    } catch (e) {
      container.innerHTML = `<p style="color:var(--clr-danger)">Error: ${e.message}</p>`;
    }
  },

  async materias(container) {
    setLoading(container);
    try {
      const data = await MateriaService.listar();
      container.innerHTML = `<p style="color:var(--clr-subtle)">
        ✅ ${data.length} materias cargadas. (Vista completa en Fase 2)</p>`;
    } catch (e) {
      container.innerHTML = `<p style="color:var(--clr-danger)">Error: ${e.message}</p>`;
    }
  },

  async reservas(container) {
    setLoading(container);
    try {
      const data = await ReservaService.listar();
      container.innerHTML = `<p style="color:var(--clr-subtle)">
        ✅ ${data.length} reservas cargadas. (Vista completa en Fase 2)</p>`;
    } catch (e) {
      container.innerHTML = `<p style="color:var(--clr-danger)">Error: ${e.message}</p>`;
    }
  },

  async avisos(container) {
    setLoading(container);
    try {
      const data = await AvisoService.listar();
      container.innerHTML = `<p style="color:var(--clr-subtle)">
        ✅ ${data.length} avisos cargados. (Vista completa en Fase 2)</p>`;
    } catch (e) {
      container.innerHTML = `<p style="color:var(--clr-danger)">Error: ${e.message}</p>`;
    }
  },

  async usuarios(container) {
    setLoading(container);
    try {
      const data = await UsuarioService.listar();
      container.innerHTML = `<p style="color:var(--clr-subtle)">
        ✅ ${data.length} usuarios cargados. (Vista completa en Fase 2)</p>`;
    } catch (e) {
      container.innerHTML = `<p style="color:var(--clr-danger)">Error: ${e.message}</p>`;
    }
  },

  async comision(container) {
    setLoading(container);
    try {
      const data = await ProfesorMateriaService.listar();
      container.innerHTML = `<p style="color:var(--clr-subtle)">
        ✅ ${data.length} comisiones cargadas. (Vista completa en Fase 2)</p>`;
    } catch (e) {
      container.innerHTML = `<p style="color:var(--clr-danger)">Error: ${e.message}</p>`;
    }
  },
};

// ── ARRANQUE ──────────────────────────────────────────────────
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => App.init());
} else {
  App.init();
}
