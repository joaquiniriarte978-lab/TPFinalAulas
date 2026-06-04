// ============================================================
//  utils/ui.js  –  Utilitarios de UI reutilizables
// ============================================================

// ── TOAST ─────────────────────────────────────────────────────
export const Toast = {
  _icons: { success: '✓', error: '✕', info: 'ℹ', warning: '⚠' },

  show(message, type = 'info', duration = 3500) {
    const container = document.getElementById('toast-container');
    const el = document.createElement('div');
    el.className = `toast ${type}`;
    el.innerHTML = `<span style="font-size:1rem">${this._icons[type]}</span><span>${message}</span>`;
    container.appendChild(el);
    setTimeout(() => {
      el.style.animation = 'slideOut .3s forwards';
      setTimeout(() => el.remove(), 300);
    }, duration);
  },

  success: (msg) => Toast.show(msg, 'success'),
  error:   (msg) => Toast.show(msg, 'error'),
  info:    (msg) => Toast.show(msg, 'info'),
  warning: (msg) => Toast.show(msg, 'warning'),
};

// ── MODAL ─────────────────────────────────────────────────────
export const Modal = {
  _el: null,

  create({ title, bodyHTML, onConfirm, confirmText = 'Guardar', confirmClass = 'btn-primary' }) {
    const existing = document.getElementById('global-modal');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.id = 'global-modal';
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `
      <div class="modal" role="dialog" aria-modal="true">
        <div class="modal-header">
          <h3 class="modal-title">${title}</h3>
          <button class="btn-close" id="modal-close" aria-label="Cerrar">✕</button>
        </div>
        <div class="modal-body" id="modal-body">${bodyHTML}</div>
        <div class="modal-footer">
          <button class="btn btn-secondary" id="modal-cancel">Cancelar</button>
          <button class="btn ${confirmClass}" id="modal-confirm">${confirmText}</button>
        </div>
      </div>`;

    document.body.appendChild(overlay);
    this._el = overlay;

    const close = () => this.close();
    overlay.querySelector('#modal-close').onclick = close;
    overlay.querySelector('#modal-cancel').onclick = close;
    overlay.onclick = (e) => { if (e.target === overlay) close(); };

    if (onConfirm) {
      overlay.querySelector('#modal-confirm').onclick = async () => {
        const btn = overlay.querySelector('#modal-confirm');
        btn.disabled = true;
        btn.textContent = 'Procesando…';
        try { await onConfirm(); } catch(e) { Toast.error(e.message); }
        btn.disabled = false;
        btn.textContent = confirmText;
      };
    }

    requestAnimationFrame(() => overlay.classList.remove('hidden'));
    return overlay;
  },

  confirm({ title, message, onConfirm }) {
    return this.create({
      title,
      bodyHTML: `<p style="font-size:.95rem;color:var(--clr-text)">${message}</p>`,
      onConfirm,
      confirmText: 'Confirmar',
      confirmClass: 'btn-danger',
    });
  },

  close() {
    if (this._el) { this._el.remove(); this._el = null; }
  },
};

// ── LOADING STATE ─────────────────────────────────────────────
export function setLoading(container, isLoading) {
  if (isLoading) {
    container.innerHTML = '<div class="spinner-wrap"><div class="spinner"></div></div>';
  }
}

// ── EMPTY STATE ───────────────────────────────────────────────
export function emptyState(icon, title, subtitle = '') {
  return `
    <div class="empty-state">
      <div class="empty-icon">${icon}</div>
      <h3>${title}</h3>
      ${subtitle ? `<p>${subtitle}</p>` : ''}
    </div>`;
}

// ── BADGES ────────────────────────────────────────────────────
export function estadoBadge(estado) {
  const map = {
    PENDIENTE:   ['badge-pendiente', '⏳ Pendiente'],
    RESUELTO:    ['badge-resuelto',  '✓ Resuelto'],
    EN_REVISION: ['badge-revision',  '🔍 En revisión'],
  };
  const [cls, label] = map[estado] || ['', estado];
  return `<span class="badge ${cls}">${label}</span>`;
}

export function tipoBadge(tipo) {
  const map = {
    AULA:               ['badge-aula',        '🏫 Aula'],
    LABORATORIO:        ['badge-laboratorio',  '🔬 Laboratorio'],
    SUM:                ['badge-sum',          '🎭 SUM'],
    LABORATORIO_TEXTIL: ['badge-laboratorio',  '🧵 Lab. Textil'],
    LABORATORIO_IDIOMAS:['badge-laboratorio',  '🌐 Lab. Idiomas'],
  };
  const [cls, label] = map[tipo] || ['', tipo];
  return `<span class="badge ${cls}">${label}</span>`;
}

export function rolBadge(rol) {
  const map = {
    ADMIN:    ['badge-admin',    '⚙ Admin'],
    PROFESOR: ['badge-profesor', '👨‍🏫 Profesor'],
    ALUMNO:   ['badge-user',     '🎓 Alumno'],
  };
  const [cls, label] = map[rol] || ['', rol];
  return `<span class="badge ${cls}">${label}</span>`;
}

// ── HASH ROUTER ───────────────────────────────────────────────
export const Router = {
  _routes: {},

  register(routes) { this._routes = routes; },

  navigate(path) { window.location.hash = path; },

  getPath() { return window.location.hash.replace('#', '') || 'dashboard'; },

  init(renderFn) {
    window.addEventListener('hashchange', renderFn);
    renderFn();
  },
};

// ── DEBOUNCE ──────────────────────────────────────────────────
export function debounce(fn, delay = 300) {
  let t;
  return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), delay); };
}

// ── FORMAT DATE ───────────────────────────────────────────────
export function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('es-AR', {
    day: '2-digit', month: 'short', year: 'numeric'
  });
}
