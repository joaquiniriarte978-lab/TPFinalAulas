
const Toast = {
  _icons: { success: '✓', error: '✕', info: 'ℹ', warning: '⚠' },
  show(message, type = 'info', duration = 3500) {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const el = document.createElement('div');
    el.className = `toast ${type}`;
    el.innerHTML = `<span style="font-size:1rem">${this._icons[type]}</span><span>${message}</span>`;
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


function setLoading(container) {
  container.innerHTML = '<div class="spinner-wrap"><div class="spinner"></div></div>';
}
function emptyState(icon, title, sub = '') {
  return `<div class="empty-state"><div class="empty-icon">${icon}</div><h3>${title}</h3>${sub ? `<p>${sub}</p>` : ''}</div>`;
}


const Modal = {
  show(title, bodyHTML, onConfirm, confirmLabel = 'Guardar', confirmClass = 'btn-primary') {
    document.getElementById('modal-overlay')?.remove();
    const overlay = document.createElement('div');
    overlay.id = 'modal-overlay';
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `
      <div class="modal">
        <div class="modal-header">
          <span class="modal-title">${title}</span>
          <button class="btn-close" id="modal-close">✕</button>
        </div>
        <div class="modal-body">${bodyHTML}</div>
        <div class="modal-footer">
          <button class="btn btn-secondary" id="modal-cancel">Cancelar</button>
          <button class="btn ${confirmClass}" id="modal-confirm">${confirmLabel}</button>
        </div>
      </div>`;
    document.body.appendChild(overlay);
    overlay.querySelector('#modal-close').onclick   = () => Modal.hide();
    overlay.querySelector('#modal-cancel').onclick  = () => Modal.hide();
    overlay.querySelector('#modal-confirm').onclick = () => onConfirm(overlay);
    overlay.addEventListener('click', e => { if (e.target === overlay) Modal.hide(); });
  },
  hide() { document.getElementById('modal-overlay')?.remove(); },
  confirm(title, message, onConfirm) {
    Modal.show(title, `<p style="color:var(--clr-subtle)">${message}</p>`, onConfirm, 'Eliminar', 'btn-danger');
  },
};


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
      this._applyRoleVisibility(session.role);
    }
    this.navigate('aulas');
  },
  _applyRoleVisibility(role) {
    const adminOnly  = ['usuarios', 'comision'];
    const profeAndUp = ['reservas', 'avisos'];
    document.querySelectorAll('.nav-item[data-section]').forEach(btn => {
      const s = btn.dataset.section;
      if (adminOnly.includes(s) && role !== 'ADMIN')                btn.style.display = 'none';
      else if (profeAndUp.includes(s) && role === 'ALUMNO')         btn.style.display = 'none';
      else                                                           btn.style.display = '';
    });
  },
  fillLogin(user, pass) {
    document.getElementById('login-user').value = user;
    document.getElementById('login-pass').value = pass;
  },
  navigate(section) {
    document.querySelectorAll('.nav-item').forEach(btn =>
      btn.classList.toggle('active', btn.dataset.section === section));
      const titles = {perfil: 'Mi Perfil', aulas:'Aulas', materias:'Materias', reservas:'Reservas',
          avisos:'Avisos', usuarios:'Usuarios', comision:'Comisiones' };
    document.getElementById('topbar-title').textContent = titles[section] || section;
    const body = document.getElementById('page-body');
    switch (section) {
      case 'aulas':    Views.aulas(body);    break;
      case 'materias': Views.materias(body); break;
      case 'reservas': Views.reservas(body); break;
      case 'avisos':   Views.avisos(body);   break;
      case 'usuarios': Views.usuarios(body); break;
      case 'comision': Views.comision(body); break;
      case 'perfil': Views.perfil(body); break;
      default:         body.innerHTML = '<p>Sección no encontrada.</p>';
    }
  },
  init() {
    if (AuthService.isAuthenticated()) this.showApp(); else this.showLogin();

    document.getElementById('btn-login').addEventListener('click', () => this._handleLogin());
    ['login-user','login-pass'].forEach(id =>
      document.getElementById(id).addEventListener('keydown', e => { if (e.key==='Enter') this._handleLogin(); }));

    document.getElementById('btn-logout').addEventListener('click', () => {
      AuthService.logout(); this.showLogin(); Toast.info('Sesión cerrada.');
    });
    document.querySelectorAll('.nav-item[data-section]').forEach(btn =>
      btn.addEventListener('click', () => this.navigate(btn.dataset.section)));

    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    document.getElementById('hamburger').addEventListener('click', () => {
      sidebar.classList.toggle('open'); overlay.classList.toggle('visible');
    });
    overlay.addEventListener('click', () => {
      sidebar.classList.remove('open'); overlay.classList.remove('visible');
    });
  },
  async _handleLogin() {
    const username = document.getElementById('login-user').value.trim();
    const password = document.getElementById('login-pass').value;
    const errorEl  = document.getElementById('login-error');
    const btnLogin = document.getElementById('btn-login');
    errorEl.style.display = 'none';
    if (!username || !password) {
      errorEl.textContent = 'Completá usuario y contraseña.'; errorEl.style.display = 'block'; return;
    }
    btnLogin.disabled = true; btnLogin.textContent = 'Verificando…';
    try {
      await AuthService.login(username, password);
      this.showApp(); Toast.success(`¡Bienvenido, ${username}!`);
    } catch (err) {
      errorEl.textContent = err.message; errorEl.style.display = 'block';
    } finally {
      btnLogin.disabled = false; btnLogin.textContent = 'Iniciar sesión';
    }
  },
};


const Views = {

async _verReservasMateria(idMateria, nombreMateria) {
  const bodyHTML = '<div class="spinner-wrap"><div class="spinner"></div></div>';
  Modal.show(`Reservas – ${nombreMateria}`, bodyHTML, () => Modal.hide(), 'Cerrar', 'btn-secondary');

  document.getElementById('modal-confirm').style.display = 'none';

  try {
    const reservas = await ReservaService.listarPorMateria(idMateria);
    const body = document.querySelector('#modal-overlay .modal-body');

    if (!reservas.length) {
      body.innerHTML = emptyState('📅', 'Sin reservas activas', `No hay reservas para ${nombreMateria}`);
      return;
    }

    body.innerHTML = `
      <div class="table-wrap">
        <table>
          <thead><tr>
            <th>Aula</th><th>Fecha</th><th>Horario</th><th>Profesor</th>
          </tr></thead>
          <tbody>
            ${reservas.map(r => `
              <tr>
                <td><strong>${r.aula?.nombre || '—'}</strong></td>
                <td>${r.fecha || '—'}</td>
                <td><code>${r.horaInicio || '?'} – ${r.horaFin || '?'}</code></td>
                <td style="color:var(--clr-subtle)">
                  ${r.comision?.profesor?.usuario?.nombre || '—'}
                </td>
              </tr>`).join('')}
          </tbody>
        </table>
      </div>`;
  } catch(e) {
    document.querySelector('#modal-overlay .modal-body').innerHTML =
      `<p style="color:var(--clr-danger)">Error: ${e.message}</p>`;
  }
},

async perfil(container) {
  setLoading(container);
  let u = {};
  try { u = await UsuarioService.miPerfil(); }
  catch(e) { container.innerHTML = `<p style="color:var(--clr-danger)">Error: ${e.message}</p>`; return; }

  const rolBadge = { ADMIN:'badge-admin', PROFESOR:'badge-profesor', ALUMNO:'badge-user' };

  container.innerHTML = `
    <div class="page-header">
      <div class="page-header-text"><h2>Mi Perfil</h2><p>Tu información personal</p></div>
    </div>
    <div class="card" style="max-width:480px">
      <div style="display:flex;align-items:center;gap:18px;margin-bottom:24px">
        <div class="user-avatar" style="width:56px;height:56px;font-size:1.4rem">
          ${u.nombre?.[0]?.toUpperCase() || '?'}
        </div>
        <div>
          <h3 style="margin-bottom:4px">${u.nombre}</h3>
          <span class="badge ${rolBadge[u.rol] || 'badge-user'}">${u.rol}</span>
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">ID</label>
        <input class="form-input" value="#${u.id}" disabled>
      </div>
      <div class="form-group">
        <label class="form-label">Nombre</label>
        <input class="form-input" value="${u.nombre}" disabled>
      </div>
      <div class="form-group">
        <label class="form-label">Email</label>
        <input class="form-input" value="${u.email}" disabled>
      </div>
      <div class="form-group">
        <label class="form-label">Rol</label>
        <input class="form-input" value="${u.rol}" disabled>
      </div>
    </div>`;
},
  async aulas(container) {
    setLoading(container);
    const isAdmin = AuthService.isAdmin();
    let data = [];
    try { data = await AulaService.listar(); } catch(e) { container.innerHTML=`<p style="color:var(--clr-danger)">Error: ${e.message}</p>`; return; }

    const tiposBadge = { AULA:'badge-aula', LABORATORIO:'badge-laboratorio', SUM:'badge-sum',
                         LABORATORIO_TEXTIL:'badge-aula', LABORATORIO_IDIOMAS:'badge-aula' };

    container.innerHTML = `
      <div class="page-header">
        <div class="page-header-text"><h2>Aulas</h2><p>${data.length} espacios disponibles</p></div>
        ${isAdmin ? `<button class="btn btn-primary" id="btn-nueva-aula">+ Nueva Aula</button>` : ''}
      </div>
      <div class="filters-bar">
        <div class="search-input-wrap"><span class="search-icon">🔍</span>
          <input class="form-input" id="search-aulas" placeholder="Buscar por nombre o equipamiento…">
        </div>
        <select class="form-select" id="filter-tipo" style="width:160px">
          <option value="">Todos los tipos</option>
          <option>AULA</option><option>LABORATORIO</option><option>SUM</option>
          <option>LABORATORIO_TEXTIL</option><option>LABORATORIO_IDIOMAS</option>
        </select>
      </div>
      <div class="table-wrap">
        <table>
          <thead><tr>
            <th>ID</th><th>Nombre</th><th>Capacidad</th><th>Tipo</th><th>Equipamiento</th>
            ${isAdmin ? '<th>Acciones</th>' : ''}
          </tr></thead>
          <tbody id="tbody-aulas"></tbody>
        </table>
      </div>`;

    const render = (rows) => {
      const tbody = document.getElementById('tbody-aulas');
      if (!rows.length) { tbody.innerHTML=`<tr><td colspan="6">${emptyState('🏫','Sin resultados')}</td></tr>`; return; }
      tbody.innerHTML = rows.map(a => `
        <tr>
          <td><code>#${a.id}</code></td>
          <td><strong>${a.nombre}</strong></td>
          <td>${a.capacidad} personas</td>
          <td><span class="badge ${tiposBadge[a.tipo]||'badge-aula'}">${a.tipo||'—'}</span></td>
          <td style="color:var(--clr-subtle)">${a.equipamiento||'—'}</td>
          ${isAdmin ? `<td class="td-actions">
            <button class="btn btn-secondary btn-sm" onclick="Views._editAula(${a.id})">✏ Editar</button>
            <button class="btn btn-danger btn-sm" onclick="Views._deleteAula(${a.id},'${a.nombre}')">🗑</button>
          </td>` : ''}
        </tr>`).join('');
    };

    render(data);
    const filter = () => {
      const q = document.getElementById('search-aulas').value.toLowerCase();
      const t = document.getElementById('filter-tipo').value;
      render(data.filter(a =>
        (!q || a.nombre.toLowerCase().includes(q) || (a.equipamiento||'').toLowerCase().includes(q)) &&
        (!t || a.tipo === t)));
    };
    document.getElementById('search-aulas').addEventListener('input', filter);
    document.getElementById('filter-tipo').addEventListener('change', filter);

    if (isAdmin) {
      document.getElementById('btn-nueva-aula').addEventListener('click', () => Views._editAula(null));
    }
  },

  _aulaForm(a = {}) {
    return `
      <div class="form-row">
        <div class="form-group"><label class="form-label">Nombre *</label>
          <input class="form-input" id="f-nombre" value="${a.nombre||''}" placeholder="Ej: Aula 101"></div>
        <div class="form-group"><label class="form-label">Capacidad *</label>
          <input class="form-input" type="number" id="f-capacidad" value="${a.capacidad||''}" min="1" placeholder="30"></div>
      </div>
      <div class="form-group"><label class="form-label">Tipo *</label>
        <select class="form-select" id="f-tipo">
          ${['AULA','LABORATORIO','SUM','LABORATORIO_TEXTIL','LABORATORIO_IDIOMAS'].map(t =>
            `<option ${a.tipo===t?'selected':''}>${t}</option>`).join('')}
        </select></div>
      <div class="form-group"><label class="form-label">Equipamiento</label>
        <input class="form-input" id="f-equip" value="${a.equipamiento||''}" placeholder="Proyector, PC, etc."></div>`;
  },

  async _editAula(id) {
    let aula = {};
    if (id) { try { aula = await AulaService.buscarId(id); } catch(e) { Toast.error(e.message); return; } }
    Modal.show(id ? 'Editar Aula' : 'Nueva Aula', this._aulaForm(aula), async () => {
      const dto = {
        nombre:       document.getElementById('f-nombre').value.trim(),
        capacidad:    parseInt(document.getElementById('f-capacidad').value),
        tipo:         document.getElementById('f-tipo').value,
        equipamiento: document.getElementById('f-equip').value.trim(),
      };
      if (!dto.nombre || !dto.capacidad) { Toast.warning('Nombre y capacidad son obligatorios.'); return; }
      try {
        if (id) await AulaService.modificar(id, dto); else await AulaService.crear(dto);
        Toast.success(id ? 'Aula actualizada.' : 'Aula creada.');
        Modal.hide(); Views.aulas(document.getElementById('page-body'));
      } catch(e) { Toast.error(e.message); }
    });
  },

  async _deleteAula(id, nombre) {
    Modal.confirm('Eliminar Aula', `¿Eliminar "${nombre}"? Esta acción no se puede deshacer.`, async () => {
      try { await AulaService.eliminar(id); Toast.success('Aula eliminada.'); Modal.hide(); Views.aulas(document.getElementById('page-body')); }
      catch(e) { Toast.error(e.message); }
    });
  },

  async materias(container) {
    setLoading(container);
    const isAdmin = AuthService.isAdmin();
    let data = [];
    try { data = await MateriaService.listar(); } catch(e) { container.innerHTML=`<p style="color:var(--clr-danger)">Error: ${e.message}</p>`; return; }

    container.innerHTML = `
      <div class="page-header">
        <div class="page-header-text"><h2>Materias</h2><p>${data.length} materias registradas</p></div>
        ${isAdmin ? `<button class="btn btn-primary" id="btn-nueva-materia">+ Nueva Materia</button>` : ''}
      </div>
      <div class="filters-bar">
        <div class="search-input-wrap"><span class="search-icon">🔍</span>
          <input class="form-input" id="search-materias" placeholder="Buscar por nombre…">
        </div>
        <select class="form-select" id="filter-lab" style="width:180px">
          <option value="">Todas</option>
          <option value="true">Requieren laboratorio</option>
          <option value="false">No requieren lab.</option>
        </select>
      </div>
      <div class="table-wrap">
        <table>
          <thead><tr>
            <th>ID</th><th>Nombre</th><th>Laboratorio</th>
            <th>Acciones</th>
          </tr></thead>
          <tbody id="tbody-materias"></tbody>
        </table>
      </div>`;

    const render = (rows) => {
      const tbody = document.getElementById('tbody-materias');
      if (!rows.length) { tbody.innerHTML=`<tr><td colspan="4">${emptyState('📚','Sin resultados')}</td></tr>`; return; }
      tbody.innerHTML = rows.map(m => `
        <tr>
          <td><code>#${m.id}</code></td>
          <td><strong>${m.nombre}</strong></td>
          <td>${m.requiereLaboratorio
            ? '<span class="badge badge-laboratorio">✓ Sí</span>'
            : '<span class="badge badge-user">✗ No</span>'}</td>
          <td class="td-actions">
            <button class="btn btn-secondary btn-sm" onclick="Views._verReservasMateria(${m.id}, '${m.nombre}')">📅 Reservas</button>
            ${isAdmin ? `
              <button class="btn btn-secondary btn-sm" onclick="Views._editMateria(${m.id})">✏ Editar</button>
              <button class="btn btn-danger btn-sm" onclick="Views._deleteMateria(${m.id},'${m.nombre}')">🗑</button>
            ` : ''}
          </td>
        </tr>`).join('');
    };

    render(data);
    const filter = () => {
      const q = document.getElementById('search-materias').value.toLowerCase();
      const l = document.getElementById('filter-lab').value;
      render(data.filter(m =>
        (!q || m.nombre.toLowerCase().includes(q)) &&
        (l === '' || String(m.requiereLaboratorio) === l)));
    };
    document.getElementById('search-materias').addEventListener('input', filter);
    document.getElementById('filter-lab').addEventListener('change', filter);
    if (isAdmin) document.getElementById('btn-nueva-materia').addEventListener('click', () => Views._editMateria(null));
  },

  _materiaForm(m = {}) {
    return `
      <div class="form-group"><label class="form-label">Nombre *</label>
        <input class="form-input" id="f-nombre" value="${m.nombre||''}" placeholder="Ej: Matemáticas I"></div>
      <label class="form-check">
        <input type="checkbox" id="f-lab" ${m.requiereLaboratorio?'checked':''}>
        <span>Requiere laboratorio</span>
      </label>`;
  },

  async _editMateria(id) {
    let mat = {};
    if (id) { try { mat = await MateriaService.buscarId(id); } catch(e) { Toast.error(e.message); return; } }
    Modal.show(id ? 'Editar Materia' : 'Nueva Materia', this._materiaForm(mat), async () => {
      const dto = {
        nombre: document.getElementById('f-nombre').value.trim(),
        requiereLaboratorio: document.getElementById('f-lab').checked,
      };
      if (!dto.nombre) { Toast.warning('El nombre es obligatorio.'); return; }
      try {
        if (id) await MateriaService.modificar(id, dto); else await MateriaService.crear(dto);
        Toast.success(id ? 'Materia actualizada.' : 'Materia creada.');
        Modal.hide(); Views.materias(document.getElementById('page-body'));
      } catch(e) { Toast.error(e.message); }
    });
  },

  async _deleteMateria(id, nombre) {
    Modal.confirm('Eliminar Materia', `¿Eliminar "${nombre}"?`, async () => {
      try { await MateriaService.eliminar(id); Toast.success('Materia eliminada.'); Modal.hide(); Views.materias(document.getElementById('page-body')); }
      catch(e) { Toast.error(e.message); }
    });
  },

  async reservas(container) {
    setLoading(container);
    const isAdmin  = AuthService.isAdmin();
    const isProfe  = AuthService.isProfesor();
    let data = [], aulas = [], comisiones = [];
    try {
        [data, aulas, comisiones] = await Promise.all([
            ReservaService.listar(), AulaService.listar(), ComisionService.listar()
        ]);
    } catch(e) { container.innerHTML=`<p style="color:var(--clr-danger)">Error: ${e.message}</p>`; return; }

    const aulaMap     = Object.fromEntries(aulas.map(a => [a.id, a.nombre]));
  const comisionMap = Object.fromEntries(comisiones.map(c => [c.id, `${c.materiaNombre||'—'} (${c.profesorNombre||'—'})`]));

    container.innerHTML = `
      <div class="page-header">
        <div class="page-header-text"><h2>Reservas</h2><p>${data.length} reservas registradas</p></div>
        ${isProfe ? `<button class="btn btn-primary" id="btn-nueva-reserva">+ Nueva Reserva</button>` : ''}
      </div>
      <div class="filters-bar">
        <div class="search-input-wrap"><span class="search-icon">🔍</span>
          <input class="form-input" id="search-reservas" placeholder="Buscar por aula o fecha…">
        </div>
        <select class="form-select" id="filter-estado-r" style="width:160px">
          <option value="">Todos los estados</option>
          <option>RESERVADA</option><option>CANCELADA</option>
        </select>
      </div>
      <div class="table-wrap">
        <table>
          <thead><tr>
            <th>ID</th><th>Aula</th><th>Comisión</th><th>Fecha</th><th>Horario</th><th>Estado</th>
            ${isProfe||isAdmin ? '<th>Acciones</th>' : ''}
          </tr></thead>
          <tbody id="tbody-reservas"></tbody>
        </table>
      </div>`;

    const render = (rows) => {
      const tbody = document.getElementById('tbody-reservas');
      if (!rows.length) { tbody.innerHTML=`<tr><td colspan="7">${emptyState('📅','Sin reservas')}</td></tr>`; return; }
      tbody.innerHTML = rows.map(r => `
        <tr>
          <td><code>#${r.id}</code></td>
          <td>${aulaMap[r.aula?.id] || r.aula?.nombre || '—'}</td>
          <td style="font-size:.8rem;color:var(--clr-subtle)">${comisionMap[r.comision?.id]||'—'}</td>
          <td>${r.fecha||'—'}</td>
          <td><code>${r.horaInicio||'?'} – ${r.horaFin||'?'}</code></td>
          <td><span class="badge ${r.estadoReserva==='RESERVADA'?'badge-resuelto':'badge-pendiente'}">${r.estadoReserva||'—'}</span></td>
          ${isProfe||isAdmin ? `<td class="td-actions">
            ${isProfe&&r.estadoReserva==='RESERVADA'?`<button class="btn btn-secondary btn-sm" onclick="Views._cancelarReserva(${r.id})">⛔ Cancelar</button>`:''}
            ${isAdmin?`<button class="btn btn-secondary btn-sm" onclick="Views._editReserva(${r.id})">✏ Editar</button>
            <button class="btn btn-danger btn-sm" onclick="Views._deleteReserva(${r.id})">🗑</button>`:''}
          </td>` : ''}
        </tr>`).join('');
    };

    render(data);
    const filter = () => {
      const q = document.getElementById('search-reservas').value.toLowerCase();
      const e = document.getElementById('filter-estado-r').value;
      render(data.filter(r =>
        (!q || (r.fecha||'').includes(q) || (aulaMap[r.aula?.id]||'').toLowerCase().includes(q)) &&
        (!e || r.estadoReserva === e)));
    };
    document.getElementById('search-reservas').addEventListener('input', filter);
    document.getElementById('filter-estado-r').addEventListener('change', filter);

    if (isProfe) {
      document.getElementById('btn-nueva-reserva').addEventListener('click', () =>
        Views._editReserva(null, aulas, comisiones));
    }
    Views._reservaCache = { aulas, comisiones };
  },

  _reservaCache: { aulas:[], comisiones:[] },

  _reservaForm(r = {}, aulas = [], comisiones = []) {
    return `
      <div class="form-group"><label class="form-label">Aula *</label>
        <select class="form-select" id="f-aula">
          <option value="">— Seleccionar —</option>
          ${aulas.map(a => `<option value="${a.id}" ${r.aula?.id===a.id?'selected':''}>${a.nombre}</option>`).join('')}
        </select></div>
      <div class="form-group"><label class="form-label">Comisión *</label>
        <select class="form-select" id="f-comision">
          <option value="">— Seleccionar —</option>
${comisiones.map(c => `<option value="${c.id}" ${r.comision?.id===c.id?'selected':''}>${c.materiaNombre||'—'} · ${c.profesorNombre||'—'}</option>`).join('')}        </select></div>
      <div class="form-group"><label class="form-label">Fecha *</label>
        <input class="form-input" type="date" id="f-fecha" value="${r.fecha||''}"></div>
      <div class="form-row">
        <div class="form-group"><label class="form-label">Hora inicio *</label>
          <input class="form-input" type="time" id="f-hinicio" value="${r.horaInicio||''}"></div>
        <div class="form-group"><label class="form-label">Hora fin *</label>
          <input class="form-input" type="time" id="f-hfin" value="${r.horaFin||''}"></div>
      </div>`;
  },

  async _editReserva(id) {
    const { aulas, comisiones } = Views._reservaCache;
    let r = {};
    if (id) { try { r = await ReservaService.buscarId(id); } catch(e) { Toast.error(e.message); return; } }
    Modal.show(id?'Editar Reserva':'Nueva Reserva', this._reservaForm(r, aulas, comisiones), async () => {
      const dto = {
        id_aula:      parseInt(document.getElementById('f-aula').value),
        id_comision:  parseInt(document.getElementById('f-comision').value),
        fecha:        document.getElementById('f-fecha').value,
        horaInicio:   document.getElementById('f-hinicio').value,
        horaFin:      document.getElementById('f-hfin').value,
      };
      if (!dto.id_aula||!dto.id_comision||!dto.fecha||!dto.horaInicio||!dto.horaFin) { Toast.warning('Completá todos los campos.'); return; }
      try {
        if (id) await ReservaService.modificar(id, dto); else await ReservaService.crear(dto);
        Toast.success(id?'Reserva actualizada.':'Reserva creada.');
        Modal.hide(); Views.reservas(document.getElementById('page-body'));
      } catch(e) { Toast.error(e.message); }
    });
  },

  async _cancelarReserva(id) {
    Modal.confirm('Cancelar Reserva', '¿Cancelar esta reserva?', async () => {
      try {
        await http.put(`${ENDPOINTS.reservas}/cancelar/${id}`);
        Toast.success('Reserva cancelada.'); Modal.hide(); Views.reservas(document.getElementById('page-body'));
      } catch(e) { Toast.error(e.message); }
    });
  },

  async _deleteReserva(id) {
    Modal.confirm('Eliminar Reserva', '¿Eliminar esta reserva definitivamente?', async () => {
      try { await ReservaService.eliminar(id); Toast.success('Reserva eliminada.'); Modal.hide(); Views.reservas(document.getElementById('page-body')); }
      catch(e) { Toast.error(e.message); }
    });
  },

  async avisos(container) {
    setLoading(container);
    const isAdmin = AuthService.isAdmin();
    const isProfe = AuthService.isProfesor();
    let data = [], aulas = [], usuarios = [];
    try {
      [data, aulas, usuarios] = await Promise.all([
        AvisoService.listar(), AulaService.listar(), UsuarioService.listar()
      ]);
    } catch(e) { container.innerHTML=`<p style="color:var(--clr-danger)">Error: ${e.message}</p>`; return; }

    const estadoBadge = { PENDIENTE:'badge-pendiente', RESUELTO:'badge-resuelto', EN_REVISION:'badge-revision' };

    container.innerHTML = `
      <div class="page-header">
        <div class="page-header-text"><h2>Avisos</h2><p>${data.length} avisos registrados</p></div>
        ${isProfe ? `<button class="btn btn-primary" id="btn-nuevo-aviso">+ Nuevo Aviso</button>` : ''}
      </div>
      <div class="filters-bar">
        <div class="search-input-wrap"><span class="search-icon">🔍</span>
          <input class="form-input" id="search-avisos" placeholder="Buscar por mensaje o aula…">
        </div>
        <select class="form-select" id="filter-estado-a" style="width:160px">
          <option value="">Todos los estados</option>
          <option>PENDIENTE</option><option>RESUELTO</option><option>EN_REVISION</option>
        </select>
      </div>
      <div class="table-wrap">
        <table>
          <thead><tr>
            <th>ID</th><th>Aula</th><th>Usuario</th><th>Mensaje</th><th>Fecha</th><th>Estado</th>
            ${isAdmin||isProfe?'<th>Acciones</th>':''}
          </tr></thead>
          <tbody id="tbody-avisos"></tbody>
        </table>
      </div>`;

    const render = (rows) => {
      const tbody = document.getElementById('tbody-avisos');
      if (!rows.length) { tbody.innerHTML=`<tr><td colspan="7">${emptyState('🔔','Sin avisos')}</td></tr>`; return; }
      tbody.innerHTML = rows.map(a => `
        <tr>
          <td><code>#${a.id}</code></td>
          <td>${a.aula?.nombre||'—'}</td>
          <td style="font-size:.8rem;color:var(--clr-subtle)">${a.usuario?.nombre||'—'}</td>
          <td style="max-width:220px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${a.mensaje||'—'}</td>
          <td>${a.fecha||'—'}</td>
          <td><span class="badge ${estadoBadge[a.estado]||'badge-user'}">${a.estado||'—'}</span></td>
          ${isAdmin || isProfe ? `<td class="td-actions">
            ${isProfe ? `<button class="btn btn-secondary btn-sm" onclick="Views._editAviso(${a.id})">✏ Editar</button>` : ''}
            ${isAdmin ? `<button class="btn btn-secondary btn-sm" onclick="Views._editEstadoAviso(${a.id})">Estado</button>` : ''}
            ${isAdmin ? `<button class="btn btn-danger btn-sm" onclick="Views._deleteAviso(${a.id})">🗑</button>` : ''}
          </td>` : ''}
        </tr>`).join('');
    };

    render(data);
    const filter = () => {
      const q = document.getElementById('search-avisos').value.toLowerCase();
      const e = document.getElementById('filter-estado-a').value;
      render(data.filter(a =>
        (!q || (a.mensaje||'').toLowerCase().includes(q) || (a.aula?.nombre||'').toLowerCase().includes(q)) &&
        (!e || a.estado === e)));
    };
    document.getElementById('search-avisos').addEventListener('input', filter);
    document.getElementById('filter-estado-a').addEventListener('change', filter);
    Views._avisoCache = { aulas, usuarios };
    if (isProfe) document.getElementById('btn-nuevo-aviso').addEventListener('click', () => Views._editAviso(null));
  },

  _avisoCache: { aulas:[], usuarios:[] },

  _avisoForm(a = {}, aulas = []) {
    return `
      <div class="form-group"><label class="form-label">Aula *</label>
        <select class="form-select" id="f-aula">
          <option value="">— Seleccionar —</option>
          ${aulas.map(au => `<option value="${au.id}" ${a.aula?.id===au.id?'selected':''}>${au.nombre}</option>`).join('')}
        </select></div>

      <div class="form-group"><label class="form-label">Mensaje *</label>
        <textarea class="form-input" id="f-mensaje">${a.mensaje || ''}</textarea>
      </div>
    `;
  },

  async _editAviso(id) {
    const { aulas } = Views._avisoCache;
    let a = {};

    if (id) {
      try {
        a = await AvisoService.buscarId(id);
      } catch(e) {
        Toast.error(e.message);
        return;
      }
    }

    Modal.show(id ? 'Editar Aviso' : 'Nuevo Aviso', this._avisoForm(a, aulas), async () => {
      const dto = {
        id_aula: parseInt(document.getElementById('f-aula').value),
        mensaje: document.getElementById('f-mensaje').value.trim(),
      };

      if (!dto.id_aula || !dto.mensaje) {
        Toast.warning('Aula y mensaje son obligatorios.');
        return;
      }

      try {
        if (id) {
          await AvisoService.modificar(id, dto);
        } else {
          await AvisoService.crear(dto);
        }

        Toast.success(id ? 'Aviso actualizado.' : 'Aviso creado.');
        Modal.hide();
        Views.avisos(document.getElementById('page-body'));
      } catch(e) {
        Toast.error(e.message);
      }
    });
  },

  async _editEstadoAviso(id) {
    let a = {};

    try {
      a = await AvisoService.buscarId(id);
    } catch(e) {
      Toast.error(e.message);
      return;
    }

    Modal.show('Cambiar estado del aviso', this._avisoEstadoForm(a), async () => {
      const dto = {
        estado: document.getElementById('f-estado').value
      };

      try {
        await AvisoService.cambiarEstado(id, dto);

        Toast.success('Estado del aviso actualizado.');
        Modal.hide();
        Views.avisos(document.getElementById('page-body'));
      } catch(e) {
        Toast.error(e.message);
      }
    });
  },

  _avisoEstadoForm(a = {}) {
    return `
      <div class="form-group">
        <label class="form-label">Estado *</label>
        <select class="form-select" id="f-estado">
          <option value="PENDIENTE" ${a.estado === 'PENDIENTE' ? 'selected' : ''}>PENDIENTE</option>
          <option value="RESUELTO" ${a.estado === 'RESUELTO' ? 'selected' : ''}>RESUELTO</option>
        </select>
      </div>`;
  },

  async _deleteAviso(id) {
    Modal.confirm('Eliminar Aviso', '¿Eliminar este aviso?', async () => {
      try { await AvisoService.eliminar(id); Toast.success('Aviso eliminado.'); Modal.hide(); Views.avisos(document.getElementById('page-body')); }
      catch(e) { Toast.error(e.message); }
    });
  },

  async usuarios(container) {
    setLoading(container);
    if (!AuthService.isAdmin()) { container.innerHTML = emptyState('🔒','Acceso denegado','Solo administradores.'); return; }
    let data = [];
    try { data = await UsuarioService.listar(); } catch(e) { container.innerHTML=`<p style="color:var(--clr-danger)">Error: ${e.message}</p>`; return; }

    const rolBadge = { ADMIN:'badge-admin', PROFESOR:'badge-profesor', ALUMNO:'badge-user' };

    container.innerHTML = `
      <div class="page-header">
        <div class="page-header-text"><h2>Usuarios</h2><p>${data.length} usuarios registrados</p></div>
        <button class="btn btn-primary" id="btn-nuevo-usuario">+ Nuevo Usuario</button>
      </div>
      <div class="filters-bar">
        <div class="search-input-wrap"><span class="search-icon">🔍</span>
          <input class="form-input" id="search-usuarios" placeholder="Buscar por nombre o email…">
        </div>
        <select class="form-select" id="filter-rol" style="width:140px">
          <option value="">Todos los roles</option>
          <option>ADMIN</option><option>PROFESOR</option><option>ALUMNO</option>
        </select>
      </div>
      <div class="table-wrap">
        <table>
          <thead><tr><th>ID</th><th>Nombre</th><th>Email</th><th>Rol</th><th>Acciones</th></tr></thead>
          <tbody id="tbody-usuarios"></tbody>
        </table>
      </div>`;

    const render = (rows) => {
      const tbody = document.getElementById('tbody-usuarios');
      if (!rows.length) { tbody.innerHTML=`<tr><td colspan="5">${emptyState('👤','Sin resultados')}</td></tr>`; return; }
      tbody.innerHTML = rows.map(u => `
        <tr>
          <td><code>#${u.id||'—'}</code></td>
          <td><strong>${u.nombre}</strong></td>
          <td style="color:var(--clr-subtle)">${u.email}</td>
          <td><span class="badge ${rolBadge[u.rol]||'badge-user'}">${u.rol||'—'}</span></td>
          <td class="td-actions">
            <button class="btn btn-secondary btn-sm" onclick="Views._editUsuario(${u.id})">✏ Editar</button>
            <button class="btn btn-danger btn-sm" onclick="Views._deleteUsuario(${u.id}, '${u.nombre}')">🗑</button>
          </td>
        </tr>`).join('');
    };

    render(data);
    const filter = () => {
      const q = document.getElementById('search-usuarios').value.toLowerCase();
      const r = document.getElementById('filter-rol').value;
      render(data.filter(u =>
        (!q || u.nombre.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)) &&
        (!r || u.rol === r)));
    };
    document.getElementById('search-usuarios').addEventListener('input', filter);
    document.getElementById('filter-rol').addEventListener('change', filter);
    document.getElementById('btn-nuevo-usuario').addEventListener('click', () => Views._editUsuario(null));
  },

  _usuarioForm(u = {}, materias = []) {
    return `
    <div class="form-group"><label class="form-label">Nombre *</label>
      <input class="form-input" id="f-nombre" value="${u.nombre||''}" placeholder="Juan García"></div>

    <div class="form-group"><label class="form-label">Email *</label>
      <input class="form-input" type="email" id="f-email" value="${u.email||''}" placeholder="juan@uni.edu"></div>

    <div class="form-group"><label class="form-label">Contraseña ${u.id?'(dejar vacío para no cambiar)':'*'}</label>
      <input class="form-input" type="password" id="f-pass" placeholder="••••••••"></div>

    <div class="form-group"><label class="form-label">Rol *</label>
      <select class="form-select" id="f-rol">
        ${['ALUMNO','PROFESOR','ADMIN'].map(r=>`<option ${u.rol===r?'selected':''}>${r}</option>`).join('')}
      </select></div>

    <div class="form-group" id="materias-profesor-group" style="display:none">
      <label class="form-label">Materias que puede dar *</label>

      <div style="display:grid;gap:8px;max-height:180px;overflow:auto;border:1px solid var(--clr-border);border-radius:8px;padding:10px;background:white">
      ${materias.map(m => `
  <label style="display:flex;align-items:center;gap:8px;font-size:.9rem;cursor:pointer">
    <input
      type="checkbox"
      class="f-materia-profesor"
      value="${m.id}"
      ${(u.materiasIds || []).includes(m.id) ? 'checked' : ''}
    >
    <span>${m.nombre}</span>
  </label>
`).join('')}
      </div>
    </div>`;
  },
  async _editUsuario(id) {
    let u = {};
    let materias = [];

    try {
      materias = await MateriaService.listar();

      if (id) {
        u = await UsuarioService.buscarId(id);
      }
    } catch(e) {
      Toast.error(e.message);
      return;
    }

    Modal.show(id ? 'Editar Usuario' : 'Nuevo Usuario', this._usuarioForm(u, materias), async () => {
      const pass = document.getElementById('f-pass').value;

      const materiasSeleccionadas = Array.from(
          document.querySelectorAll('.f-materia-profesor:checked')
      ).map(input => parseInt(input.value));

      const dto = {
        nombre:   document.getElementById('f-nombre').value.trim(),
        email:    document.getElementById('f-email').value.trim(),
        rol:      document.getElementById('f-rol').value,
        password: pass || (u.password || ''),
        materiasIds: document.getElementById('f-rol').value === 'PROFESOR'
            ? materiasSeleccionadas
            : [],
      };

      if (!dto.nombre || !dto.email) {
        Toast.warning('Nombre y email son obligatorios.');
        return;
      }

      if (!id && !pass) {
        Toast.warning('La contraseña es obligatoria para usuarios nuevos.');
        return;
      }

      if (dto.rol === 'PROFESOR' && dto.materiasIds.length === 0) {
        Toast.warning('Seleccioná al menos una materia para el profesor.');
        return;
      }

      try {
        if (id) {
          await UsuarioService.modificar(id, dto);
        } else {
          await UsuarioService.crear(dto);
        }

        Toast.success(id ? 'Usuario actualizado.' : 'Usuario creado.');
        Modal.hide();
        Views.usuarios(document.getElementById('page-body'));
      } catch(e) {
        Toast.error(e.message);
      }
    });

    const rolSelect = document.getElementById('f-rol');
    const materiasGroup = document.getElementById('materias-profesor-group');

    const toggleMateriasProfesor = () => {
      materiasGroup.style.display = rolSelect.value === 'PROFESOR' ? 'block' : 'none';
    };

    toggleMateriasProfesor();
    rolSelect.addEventListener('change', toggleMateriasProfesor);
  },
  async _deleteUsuario(id, nombre) {
    Modal.confirm('Eliminar Usuario', `¿Eliminar a "${nombre}"?`, async () => {
      try { await UsuarioService.eliminar(id); Toast.success('Usuario eliminado.'); Modal.hide(); Views.usuarios(document.getElementById('page-body')); }
      catch(e) { Toast.error(e.message); }
    });
  },

  async comision(container) {
    setLoading(container);
    if (!AuthService.isAdmin()) { container.innerHTML = emptyState('🔒','Acceso denegado','Solo administradores.'); return; }
    let data = [], materias = [], usuarios = [];
    try {
        [data, materias, usuarios] = await Promise.all([
            ComisionService.listar(), MateriaService.listar(), UsuarioService.listar()
        ]);
    } catch(e) { container.innerHTML=`<p style="color:var(--clr-danger)">Error: ${e.message}</p>`; return; }

    const profesores = usuarios.filter(u => u.rol === 'PROFESOR' || u.rol === 'ADMIN');

    container.innerHTML = `
      <div class="page-header">
        <div class="page-header-text"><h2>Comisiones</h2><p>${data.length} comisiones registradas</p></div>
        <button class="btn btn-primary" id="btn-nueva-comision">+ Nueva Comisión</button>
      </div>
      <div class="filters-bar">
        <div class="search-input-wrap"><span class="search-icon">🔍</span>
          <input class="form-input" id="search-comisiones" placeholder="Buscar por materia o profesor…">
        </div>
      </div>
      <div class="table-wrap">
        <table>
          <thead><tr>
            <th>ID</th><th>Materia</th><th>Profesor</th><th>Cant. Alumnos</th><th>Acciones</th>
          </tr></thead>
          <tbody id="tbody-comisiones"></tbody>
        </table>
      </div>`;

    const render = (rows) => {
      const tbody = document.getElementById('tbody-comisiones');
      if (!rows.length) { tbody.innerHTML=`<tr><td colspan="5">${emptyState('🔗','Sin comisiones')}</td></tr>`; return; }
      tbody.innerHTML = rows.map(c => `
        <tr>
          <td><code>#${c.id}</code></td>
          <td><strong>${c.materiaNombre||'—'}</strong></td>
          <td>${c.profesorNombre||'—'}</td>
          <td>${c.cantAlumnos||'—'}</td>
          <td class="td-actions">
            <button class="btn btn-secondary btn-sm" onclick="Views._editComision(${c.id})">✏ Editar</button>
            <button class="btn btn-danger btn-sm" onclick="Views._deleteComision(${c.id})">🗑</button>
          </td>
        </tr>`).join('');
    };

    render(data);
    document.getElementById('search-comisiones').addEventListener('input', e => {
      const q = e.target.value.toLowerCase();
      render(data.filter(c =>
        (c.materiaNombre||'').toLowerCase().includes(q) ||
        (c.profesorNombre||'').toLowerCase().includes(q)
      ));
    });
    Views._comisionCache = { materias, profesores };
    document.getElementById('btn-nueva-comision').addEventListener('click', () => Views._editComision(null));
  },

  _comisionCache: { materias:[], profesores:[] },

  _comisionForm(c = {}, materias = [], profesores = []) {
    return `
      <div class="form-group"><label class="form-label">Materia *</label>
        <select class="form-select" id="f-materia">
          <option value="">— Seleccionar —</option>
          ${materias.map(m=>`<option value="${m.id}" ${c.materia?.id===m.id?'selected':''}>${m.nombre}</option>`).join('')}
        </select></div>
      <div class="form-group"><label class="form-label">Profesor *</label>
        <select class="form-select" id="f-profesor">
          <option value="">— Seleccionar —</option>
          ${profesores.map(p=>`<option value="${p.id}" ${c.profesor?.id===p.id?'selected':''}>${p.nombre}</option>`).join('')}
        </select></div>
      <div class="form-group"><label class="form-label">Cantidad de Alumnos *</label>
        <input class="form-input" type="number" id="f-cant" value="${c.cantAlumnos||''}" min="1" placeholder="30"></div>`;
  },

   async _editComision(id) {
           const { materias, profesores } = Views._comisionCache;
           let c = {};
           if (id) { try { c = await ComisionService.buscarId(id); } catch(e) { Toast.error(e.message); return; } }

           Modal.show(id ? 'Editar Comisión' : 'Nueva Comisión', this._comisionForm(c, materias, profesores), async () => {

               const idMateria = document.getElementById('f-materia').value;
               const idProfesor = document.getElementById('f-profesor').value;
               const cantAlumnos = document.getElementById('f-cant').value;

               if (!idMateria || !idProfesor || !cantAlumnos) {
                   Toast.error("Por favor, completa todos los campos obligatorios (*)");
                   return;
               }

               const dto = {
                   id_materia: parseInt(idMateria),
                   id_profesor: parseInt(idProfesor),
                   cantAlumnos: parseInt(cantAlumnos)
               };

               try {
                   if (id) await ComisionService.modificar(id, dto); else await ComisionService.crear(dto);
                   Toast.success(id ? 'Comisión actualizada.' : 'Comisión creada.');
                   Modal.hide();
                   Views.comision(document.getElementById('page-body'));
               } catch(e) {
                   Toast.error(e.message);
               }
           });

           const fMateria = document.getElementById('f-materia');
           const fProfesor = document.getElementById('f-profesor');

           const filtrarProfesores = () => {
               const idMateria = parseInt(fMateria.value);

               if (!idMateria) {
                   fProfesor.innerHTML = '<option value="">— Seleccionar —</option>';
                   return;
               }

               const profesAptos = profesores.filter(p => p.materiasIds && p.materiasIds.includes(idMateria));

               fProfesor.innerHTML = '<option value="">— Seleccionar —</option>' +
                   profesAptos.map(p => `<option value="${p.id}" ${c.id_profesor === p.id ? 'selected' : ''}>${p.nombre}</option>`).join('');
           };

           fMateria.addEventListener('change', filtrarProfesores);

           if (c.id_materia) {
               fMateria.value = c.id_materia; // Nos aseguramos de forzar la selección
               filtrarProfesores();
               fProfesor.value = c.id_profesor || '';
           } else {
               fProfesor.innerHTML = '<option value="">— Seleccionar —</option>';
           }
       },

    async _deleteComision(id) {
        Modal.confirm('Eliminar Comisión', '¿Eliminar esta comisión?', async () => {
            try { await ComisionService.eliminar(id); Toast.success('Comisión eliminada.'); Modal.hide(); Views.comision(document.getElementById('page-body')); }
            catch(e) { Toast.error(e.message); }
        });
    },
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => App.init());
} else {
  App.init();
}
