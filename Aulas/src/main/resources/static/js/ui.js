
const Toast = {
  _icons: { success: '✓', error: '✕', info: 'i', warning: '!' },
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
function emptyState(title, sub = '') {
  return `<div class="empty-state"><h3>${title}</h3>${sub ? `<p>${sub}</p>` : ''}</div>`;
}


const Modal = {
  show(title, bodyHTML, onConfirm, confirmLabel = 'Guardar', confirmClass = 'btn-primary', cancelLabel = 'Cancelar') {
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
<button class="btn btn-secondary" id="modal-cancel">${cancelLabel}</button>
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
this.navigate(session?.role === 'ALUMNO' ? 'clases' : 'aulas');
  },
  _applyRoleVisibility(role) {
    const adminOnly  = ['usuarios', 'comision'];
    const profeAndUp = ['reservas', 'avisos'];
    const alumnoHidden = ['aulas', 'materias'];

    document.querySelectorAll('.nav-item[data-section]').forEach(btn => {
      const s = btn.dataset.section;

      if (alumnoHidden.includes(s) && role === 'ALUMNO')       btn.style.display = 'none';
      else if (adminOnly.includes(s) && role !== 'ADMIN')      btn.style.display = 'none';
      else if (profeAndUp.includes(s) && role === 'ALUMNO')    btn.style.display = 'none';
      else                                                     btn.style.display = '';
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
          avisos:'Avisos', usuarios:'Usuarios', comision:'Comisiones', clases:'Clases' };
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
      case 'clases': Views.clases(body); break;
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
    if (password.length < 8) {
      errorEl.textContent = 'La contraseña debe tener al menos 8 caracteres.'; errorEl.style.display = 'block'; return;
    }
    if (!/[A-Z]/.test(password)) {
      errorEl.textContent = 'La contraseña debe contener al menos una mayúscula.'; errorEl.style.display = 'block'; return;
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
async clases(container) {
  setLoading(container);

  const diasLabel = {
    LUNES: 'Lunes', MARTES: 'Martes', MIERCOLES: 'Miércoles',
    JUEVES: 'Jueves', VIERNES: 'Viernes', SABADO: 'Sábado'
  };
  const diasSemana    = ['LUNES','MARTES','MIERCOLES','JUEVES','VIERNES','SABADO'];
  const diasPorIndice = [null,'LUNES','MARTES','MIERCOLES','JUEVES','VIERNES','SABADO'];
  const diasJS        = diasPorIndice;

  const diaDesdeFecha = (fecha) => {
    if (!fecha) return '';
    const date = new Date(`${fecha}T00:00:00`);
    return Number.isNaN(date.getTime()) ? '' : (diasPorIndice[date.getDay()] || '');
  };

  const hoyDate = new Date();
  hoyDate.setHours(0, 0, 0, 0);
  const idxHoy = hoyDate.getDay();
  const corrimientoALunes = idxHoy === 0 ? -6 : 1 - idxHoy;
  const inicioSemana = new Date(hoyDate);
  inicioSemana.setDate(hoyDate.getDate() + corrimientoALunes);
  const finSemana = new Date(inicioSemana);
  finSemana.setDate(inicioSemana.getDate() + 5);

  const parseFecha = (f) => {
    if (!f) return null;
    const d = new Date(`${f}T00:00:00`);
    return Number.isNaN(d.getTime()) ? null : d;
  };


  const fijaEnEstaSemana = (c) => {
    const fi = parseFecha(c.fechaInicio);
    const ff = parseFecha(c.fechaFin);
    return !!fi && !!ff && fi <= finSemana && ff >= inicioSemana;
  };

  const reservaEnEstaSemana = (r) => {
    const f = parseFecha(r.fecha);
    return !!f && f >= inicioSemana && f <= finSemana;
  };

  let comisiones = [], reservas = [];

  try {
    comisiones = await ComisionService.listar();
    const materiasIds = [...new Set(comisiones.map(c => c.id_materia || c.materia?.id).filter(Boolean))];
    const reservasPorMateria = await Promise.all(materiasIds.map(id => ReservaService.listarPorMateria(id)));
    const reservaMap = new Map();
    reservasPorMateria.flat().forEach(r => {
      const key = r.id || `${r.comision?.id || r.id_comision}-${r.fecha}-${r.horaInicio}-${r.horaFin}-${r.aula?.id || r.id_aula}`;
      reservaMap.set(key, r);
    });
    reservas = [...reservaMap.values()];
  } catch(e) {
    container.innerHTML = `<p style="color:var(--clr-danger)">Error: ${e.message}</p>`;
    return;
  }

  const clases = [
    ...comisiones.map(c => {
      const cf = c.claseFija;
      return {
        tipo: 'Fija',
        materia: c.materiaNombre || '-',
        profesor: c.profesorNombre || '-',
        aula: cf?.aulaNombre || '-',
        dia: cf?.diaSemana || '',
        fecha: `${c.fechaInicio || '-'} / ${c.fechaFin || '-'}`,
        horario: cf ? `${cf.horaInicio || '?'} - ${cf.horaFin || '?'}` : (c.horario || '-'),
        estado: 'Fija',
        _enEstaSemana: !!cf && fijaEnEstaSemana(c)
      };
    }),
    ...reservas.map(r => {
      const c = r.comision || {};
      return {
        tipo: 'Reserva',
        materia: c.materia?.nombre || c.materiaNombre || '-',
        profesor: c.profesor?.usuario?.nombre || c.profesorNombre || '-',
        aula: r.aula?.nombre || '-',
        dia: diaDesdeFecha(r.fecha),
        fecha: r.fecha || '-',
        horario: `${r.horaInicio || '?'} - ${r.horaFin || '?'}`,
        estado: r.estadoReserva || 'Reservada',
        _enEstaSemana: reservaEnEstaSemana(r)
      };
    })
  ];

  Views._clasesCache = clases;
  const diaHoy = diasJS[new Date().getDay()] || null;

  const renderTablaRows = (rows) => {
    if (!rows.length) return `<tr><td colspan="8">${emptyState('Sin clases','No hay comisiones ni reservas para ese día.')}</td></tr>`;
    return rows.map(clase => `
      <tr>
        <td><span class="badge ${clase.tipo === 'Reserva' ? 'badge-resuelto' : 'badge-user'}">${clase.tipo}</span></td>
        <td><strong>${clase.materia}</strong></td>
        <td>${clase.profesor}</td>
        <td>${clase.aula}</td>
        <td>${diasLabel[clase.dia] || '-'}</td>
        <td style="font-size:.8rem">${clase.fecha}</td>
        <td><code>${clase.horario}</code></td>
        <td>${clase.estado}</td>
      </tr>`).join('');
  };

  const aulasUnicas = [...new Set(clases.map(c => c.aula).filter(a => a && a !== '-'))].sort();

  const renderCalendar = (rows) => {
    const rowsSemana = rows.filter(c => c._enEstaSemana);
    const indexados = rowsSemana.map((c, i) => ({...c, _idx: clases.indexOf(c)}));
    return `
      <div class="clases-calendar">
        ${diasSemana.map(dia => {
          const clasesDelDia = indexados.filter(c => c.dia === dia);
          ...
          return `
            <div class="cal-day-col">
              <div class="cal-day-header ${dia === diaHoy ? 'today' : ''}">${diasLabel[dia]}</div>
              ${clasesDelDia.length
                ? clasesDelDia.map(c => `
                    <div class="cal-clase-card tipo-${c.tipo.toLowerCase()}" onclick="Views._detalleClase(${c._idx})">
                      <div class="cal-card-materia">${c.materia}</div>
                      <div class="cal-card-info">${c.profesor}</div>
                      <div class="cal-card-info">${c.aula}</div>
                      <div class="cal-card-horario">${c.horario}</div>
                      <span class="badge ${c.tipo === 'Fija' ? 'badge-user' : 'badge-resuelto'}">${c.tipo}</span>
                    </div>`).join('')
                : '<div class="cal-day-empty">Sin clases</div>'
              }
            </div>`;
        }).join('')}
      </div>`;
  };

  container.innerHTML = `
    <div class="page-header">
      <div class="page-header-text"><h2>Clases</h2><p>${clases.length} clases entre comisiones y reservas</p></div>
      <div class="view-toggle">
        <button id="btn-vista-tabla" class="active">Tabla</button>
        <button id="btn-vista-calendario">Calendario</button>
      </div>
    </div>
    <div class="filters-bar" id="filtros-clases">
      <div class="search-input-wrap">
        <input class="form-input" id="search-clases" placeholder="Buscar por materia o profesor…">
      </div>
      <select class="form-select" id="filter-dia-clases" style="width:190px">
        <option value="">Todos los días</option>
        ${Object.entries(diasLabel).map(([v, l]) => `<option value="${v}">${l}</option>`).join('')}
      </select>
    </div>
    <div class="filters-bar" id="filtros-calendario" style="display:none">
      <select class="form-select" id="filter-aula-cal" style="width:220px">
        <option value="">Todas las aulas</option>
        ${aulasUnicas.map(a => `<option value="${a}">${a}</option>`).join('')}
      </select>
    </div>
    <div id="vista-tabla-wrap">
      <div class="table-wrap">
        <table>
          <thead><tr>
            <th>Tipo</th><th>Materia</th><th>Profesor</th><th>Aula</th><th>Día</th><th>Fecha</th><th>Horario</th><th>Estado</th>
          </tr></thead>
          <tbody id="tbody-clases">${renderTablaRows(clases)}</tbody>
        </table>
      </div>
    </div>
    <div id="vista-calendario-wrap" style="display:none">${renderCalendar(clases)}</div>`;

  const aplicarFiltrosTabla = () => {
    const dia = document.getElementById('filter-dia-clases').value;
    const q   = document.getElementById('search-clases').value.toLowerCase().trim();
    document.getElementById('tbody-clases').innerHTML = renderTablaRows(
      clases.filter(c =>
        (!dia || c.dia === dia) &&
        (!q || c.materia.toLowerCase().includes(q) || c.profesor.toLowerCase().includes(q))
      )
    );
  };

  const aplicarFiltroCalendario = () => {
    const aula = document.getElementById('filter-aula-cal').value;
    const rows = aula ? clases.filter(c => c.aula === aula) : clases;
    document.getElementById('vista-calendario-wrap').innerHTML = renderCalendar(rows);
  };

  document.getElementById('filter-dia-clases').addEventListener('change', aplicarFiltrosTabla);
  document.getElementById('search-clases').addEventListener('input', aplicarFiltrosTabla);
  document.getElementById('filter-aula-cal').addEventListener('change', aplicarFiltroCalendario);

  document.getElementById('btn-vista-tabla').addEventListener('click', () => {
    document.getElementById('vista-tabla-wrap').style.display      = '';
    document.getElementById('vista-calendario-wrap').style.display = 'none';
    document.getElementById('filtros-clases').style.display        = '';
    document.getElementById('filtros-calendario').style.display    = 'none';
    document.getElementById('btn-vista-tabla').classList.add('active');
    document.getElementById('btn-vista-calendario').classList.remove('active');
  });
  document.getElementById('btn-vista-calendario').addEventListener('click', () => {
    document.getElementById('vista-tabla-wrap').style.display      = 'none';
    document.getElementById('vista-calendario-wrap').style.display = '';
    document.getElementById('filtros-clases').style.display        = 'none';
    document.getElementById('filtros-calendario').style.display    = '';
    document.getElementById('btn-vista-tabla').classList.remove('active');
    document.getElementById('btn-vista-calendario').classList.add('active');
  });
},

_clasesCache: [],

_detalleClase(idx) {
  const c = Views._clasesCache[idx];
  if (!c) return;
  const diasLabel = { LUNES:'Lunes', MARTES:'Martes', MIERCOLES:'Miércoles', JUEVES:'Jueves', VIERNES:'Viernes', SABADO:'Sábado' };
  Modal.show(
    c.materia,
    `<div style="display:flex;flex-direction:column;gap:14px">
      <div><span class="form-label">Tipo</span><br>
        <span class="badge ${c.tipo === 'Fija' ? 'badge-user' : 'badge-resuelto'}" style="margin-top:4px">${c.tipo}</span>
      </div>
      <div><span class="form-label">Profesor</span><p style="color:var(--clr-text);margin:4px 0 0">${c.profesor}</p></div>
      <div><span class="form-label">Aula</span><p style="color:var(--clr-text);margin:4px 0 0">${c.aula}</p></div>
      <div><span class="form-label">Día</span><p style="color:var(--clr-text);margin:4px 0 0">${diasLabel[c.dia] || c.dia || '-'}</p></div>
      <div><span class="form-label">Fecha</span><p style="color:var(--clr-text);margin:4px 0 0">${c.fecha}</p></div>
      <div><span class="form-label">Horario</span><br><code style="margin-top:4px;display:inline-block">${c.horario}</code></div>
      <div><span class="form-label">Estado</span><p style="color:var(--clr-text);margin:4px 0 0">${c.estado}</p></div>
    </div>`,
    () => Modal.hide(), 'Cerrar', 'btn-secondary'
  );
  const confirmBtn = document.getElementById('modal-confirm');
  if (confirmBtn) confirmBtn.style.display = 'none';
},

async _verReservasMateria(idMateria, nombreMateria) {
  const bodyHTML = '<div class="spinner-wrap"><div class="spinner"></div></div>';
  Modal.show(`Reservas – ${nombreMateria}`, bodyHTML, () => Modal.hide(), 'Cerrar', 'btn-secondary');

  document.getElementById('modal-confirm').style.display = 'none';

  try {
    const reservas = await ReservaService.listarPorMateria(idMateria);
    const body = document.querySelector('#modal-overlay .modal-body');

    if (!reservas.length) {
      body.innerHTML = emptyState('Sin reservas activas', `No hay reservas para ${nombreMateria}`);
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
      <button class="btn btn-primary" id="btn-editar-perfil">✏ Editar perfil</button>
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

  document.getElementById('btn-editar-perfil').addEventListener('click', () => {
    Views._editarMiPerfil(u);
  });
},

async _editarMiPerfil(u) {
  const formHTML = `
    <div class="form-group">
      <label class="form-label">Nombre *</label>
      <input class="form-input" id="f-nombre" value="${u.nombre || ''}" placeholder="Tu nombre">
    </div>
    <div class="form-group">
      <label class="form-label">Email *</label>
      <input class="form-input" type="email" id="f-email" value="${u.email || ''}" placeholder="tu@email.com">
    </div>
    <div class="form-group">
      <label class="form-label">Nueva contraseña (dejar vacío para no cambiar)</label>
      <input class="form-input" type="password" id="f-pass" placeholder="••••••••">
    </div>`;

  Modal.show('Editar mi perfil', formHTML, async () => {
    const pass = document.getElementById('f-pass').value;
    const dto = {
      nombre: document.getElementById('f-nombre').value.trim(),
      email:  document.getElementById('f-email').value.trim(),
      rol:    u.rol,
    };
    if (pass) dto.password = pass;

    if (!dto.nombre || !dto.email) {
      Toast.warning('Nombre y email son obligatorios.');
      return;
    }

    try {
      await UsuarioService.modificarPerfil(dto);
      Toast.success('Perfil actualizado.');
      Modal.hide();
      Views.perfil(document.getElementById('page-body'));
    } catch(e) {
      Toast.error(e.message);
    }
  });
},
  async aulas(container) {
    setLoading(container);
    const isAdmin    = AuthService.isAdmin();
    const isProfesor = AuthService.isProfesor();
    let data = [];
    try { data = await AulaService.listar(); } catch(e) { container.innerHTML=`<p style="color:var(--clr-danger)">Error: ${e.message}</p>`; return; }

    const tiposBadge = { AULA:'badge-aula', LABORATORIO:'badge-laboratorio', SUM:'badge-sum',
                         LABORATORIO_TEXTIL:'badge-aula', LABORATORIO_IDIOMAS:'badge-aula' };
    const totalCols = isProfesor ? 6 : 5;

    container.innerHTML = `
      <div class="page-header">
        <div class="page-header-text"><h2>Aulas</h2><p>${data.length} espacios disponibles</p></div>
        ${isAdmin ? `<button class="btn btn-primary" id="btn-nueva-aula">+ Nueva Aula</button>` : ''}
      </div>
      <div class="filters-bar">
        <div class="search-input-wrap">
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
            ${isProfesor ? '<th>Acciones</th>' : ''}
          </tr></thead>
          <tbody id="tbody-aulas"></tbody>
        </table>
      </div>`;

    const render = (rows) => {
      const tbody = document.getElementById('tbody-aulas');
      if (!rows.length) { tbody.innerHTML=`<tr><td colspan="${totalCols}">${emptyState('Sin resultados')}</td></tr>`; return; }
      tbody.innerHTML = rows.map(a => `
        <tr>
          <td><code>#${a.id}</code></td>
          <td><strong>${a.nombre}</strong></td>
          <td>${a.capacidad} personas</td>
          <td><span class="badge ${tiposBadge[a.tipo]||'badge-aula'}">${a.tipo||'—'}</span></td>
          <td style="color:var(--clr-subtle)">${a.equipamiento||'—'}</td>
          ${isProfesor ? `<td class="td-actions">
            ${isAdmin ? `
            <button class="btn btn-secondary btn-sm" onclick="Views._editAula(${a.id})">Editar</button>
            <button class="btn btn-danger btn-sm" onclick="Views._deleteAula(${a.id},'${a.nombre}')">Eliminar</button>` : ''}
            <button class="btn btn-info btn-sm" onclick="Views._verAvisosAula(${a.id},'${a.nombre.replace(/'/g, "\\'")}')">Avisos</button>
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

  async _verAvisosAula(aulaId, aulaNombre) {
    let avisos = [];
    try {
      const todos = await AvisoService.listar();
      avisos = todos.filter(av => av.aula?.id === aulaId && av.estado !== 'RESUELTO');
    } catch(e) {
      Toast.error(e.message);
      return;
    }

    const estadoBadge = { PENDIENTE: 'badge-pendiente', EN_REVISION: 'badge-revision' };

    const body = avisos.length
      ? `<div class="table-wrap">
           <table>
             <thead><tr><th>Fecha</th><th>Mensaje</th><th>Estado</th><th>Reportado por</th></tr></thead>
             <tbody>
               ${avisos.map(av => `
                 <tr>
                   <td>${av.fecha || '—'}</td>
                   <td>${av.mensaje || '—'}</td>
                   <td><span class="badge ${estadoBadge[av.estado] || ''}">${av.estado}</span></td>
                   <td>${av.usuario?.nombre || '—'}</td>
                 </tr>`).join('')}
             </tbody>
           </table>
         </div>`
      : `<p style="text-align:center;color:var(--clr-subtle);padding:2rem 0">No hay avisos pendientes para esta aula.</p>`;

    Modal.show(`Avisos — ${aulaNombre}`, body, () => Modal.hide(), 'Cerrar', 'btn-secondary');
  },

  async materias(container) {
      setLoading(container);
      const isAdmin = AuthService.isAdmin();
      const session = AuthService.getSession();

      let data = [];
      try {
          data = await MateriaService.listar();

          if (session && session.role === 'PROFESOR') {
              const perfil = await UsuarioService.miPerfil();
              const misMaterias = perfil.materiasIds || [];

              data = data.filter(m => misMaterias.includes(m.id));
          }

      } catch(e) {
          container.innerHTML=`<p style="color:var(--clr-danger)">Error: ${e.message}</p>`;
          return;
      }

      container.innerHTML = `
        <div class="page-header">
          <div class="page-header-text"><h2>Materias</h2><p>${data.length} materias asignadas</p></div>
          ${isAdmin ?
  `<button class="btn btn-primary" id="btn-nueva-materia">+ Nueva Materia</button>` : ''}
        </div>
        <div class="filters-bar">
          <div class="search-input-wrap">
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
            if (!rows.length) { tbody.innerHTML=`<tr><td colspan="4">${emptyState('Sin resultados')}</td></tr>`; return; }
            tbody.innerHTML = rows.map(m => `
              <tr>
                <td><code>#${m.id}</code></td>
                <td><strong>${m.nombre}</strong></td>
                <td>${m.requiereLaboratorio
                  ? '<span class="badge badge-laboratorio">Sí</span>'
                  : '<span class="badge badge-user">No</span>'}</td>
                <td class="td-actions">

                  <button class="btn btn-secondary btn-sm" onclick="Views._verReservasMateria(${m.id}, '${m.nombre}')">Reservas</button>
                  <button class="btn btn-secondary btn-sm" onclick="Views._verComisionesMateria(${m.id}, '${m.nombre}')">Comisiones</button>

                  ${isAdmin ? `
                    <button class="btn btn-secondary btn-sm" onclick="Views._editMateria(${m.id})">Editar</button>
                    <button class="btn btn-danger btn-sm" onclick="Views._deleteMateria(${m.id},'${m.nombre}')">Eliminar</button>
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
    async _verComisionesMateria(idMateria, nombreMateria) {
        Modal.show(`Comisiones - ${nombreMateria}`, `
          <div id="modal-comisiones-body" class="spinner-wrap" style="padding:30px;">
            <div class="spinner"></div>
          </div>
        `, null);

        try {
            const session = AuthService.getSession();
            let nombreProfesorLogueado = null;
            if (session && session.role === 'PROFESOR') {
                const perfil = await UsuarioService.miPerfil();
                nombreProfesorLogueado = perfil.nombre;
            }
            const comisiones = await ComisionService.listarPorMateria(idMateria);
            let comisionesFiltradas = comisiones;
            if (session && session.role === 'PROFESOR') {
                comisionesFiltradas = comisiones.filter(c => c.profesorNombre === nombreProfesorLogueado);
            }

            const modalBody = document.getElementById('modal-comisiones-body');
            if (!modalBody) return;

            const diasLabel = {
                LUNES:'Lunes', MARTES:'Martes', MIERCOLES:'Miércoles',
                JUEVES:'Jueves', VIERNES:'Viernes', SABADO:'Sábado'
            };

            let filas = '';
            if (comisionesFiltradas.length === 0) {
                filas = '<tr><td colspan="5" style="text-align:center;padding:20px;color:var(--clr-muted);">No se encontraron comisiones para esta materia.</td></tr>';
            } else {
                comisionesFiltradas.forEach((com, i) => {
                    const cf = com.claseFija;
                    const cfTexto = cf
                        ? (diasLabel[cf.diaSemana] || cf.diaSemana) + ' ' + cf.horaInicio + '–' + cf.horaFin + ' · ' + cf.aulaNombre
                        : '—';
                    filas += '<tr>'
                        + '<td><strong>Comisión ' + (i + 1) + '</strong></td>'
                        + '<td>' + (com.profesorNombre || '—') + '</td>'
                        + '<td><span class="badge badge-laboratorio">' + com.cantAlumnos + ' alumnos</span></td>'
                        + '<td>' + (com.horario || '—') + '</td>'
                        + '<td style="font-size:.8rem">' + cfTexto + '</td>'
                        + '</tr>';
                });
            }

            modalBody.className = 'table-wrap';
            modalBody.style = 'margin-top:0;max-height:350px;overflow-y:auto;';
            modalBody.innerHTML = '<table>'
                + '<thead><tr>'
                + '<th>Comisión</th>'
                + '<th>Profesor</th>'
                + '<th>Alumnos</th>'
                + '<th>Horario</th>'
                + '<th>Clase Fija</th>'
                + '</tr></thead>'
                + '<tbody>' + filas + '</tbody>'
                + '</table>';

        } catch (e) {
            Modal.hide();
            Toast.error('Error al obtener las comisiones: ' + e.message);
        }
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
    const isSoloProfe = isProfe && !isAdmin;
    let data = [], aulas = [], comisiones = [], comisionesForm = [];
    try {
        const results = await Promise.all([
            ReservaService.listar(), AulaService.listar(), ComisionService.listar(),
            ...(isSoloProfe ? [ComisionService.misComisiones()] : [])
        ]);
        [data, aulas, comisiones] = results;
        comisionesForm = isSoloProfe ? results[3] : comisiones;
    } catch(e) { container.innerHTML=`<p style="color:var(--clr-danger)">Error: ${e.message}</p>`; return; }

    const aulaMap     = Object.fromEntries(aulas.map(a => [a.id, a.nombre]));
  const comisionMap = Object.fromEntries(comisiones.map(c => [c.id, `${c.materiaNombre||'—'} (${c.profesorNombre||'—'})`]));

    container.innerHTML = `
      <div class="page-header">
        <div class="page-header-text"><h2>Reservas</h2><p>${data.length} reservas registradas</p></div>
        ${isProfe ? `<button class="btn btn-primary" id="btn-nueva-reserva">+ Nueva Reserva</button>` : ''}
      </div>
      <div class="filters-bar">
        <div class="search-input-wrap">
          <input class="form-input" id="search-reservas" placeholder="Buscar por aula o fecha…">
        </div>
        <select class="form-select" id="filter-estado-r" style="width:160px">
          <option value="">Todos los estados</option>
          <option>RESERVADA</option>
          <option>FINALIZADA</option>
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
      if (!rows.length) { tbody.innerHTML=`<tr><td colspan="7">${emptyState('Sin reservas')}</td></tr>`; return; }
      tbody.innerHTML = rows.map(r => `
        <tr>
          <td><code>#${r.id}</code></td>
          <td>${aulaMap[r.aula?.id] || r.aula?.nombre || '—'}</td>
          <td style="font-size:.8rem;color:var(--clr-subtle)">${comisionMap[r.comision?.id]||'—'}</td>
          <td>${r.fecha||'—'}</td>
          <td><code>${r.horaInicio||'?'} – ${r.horaFin||'?'}</code></td>
          <td><span class="badge ${r.estadoReserva==='RESERVADA'?'badge-resuelto':'badge-pendiente'}">${r.estadoReserva||'—'}</span></td>
          ${isProfe||isAdmin ? `<td class="td-actions">
            ${isProfe&&r.estadoReserva==='RESERVADA'?`<button class="btn btn-danger btn-sm" onclick="Views._cancelarReserva(${r.id})">Cancelar</button>`:''}
            ${isAdmin && r.estadoReserva === 'RESERVADA'
              ? `<button class="btn btn-secondary btn-sm" onclick="Views._editReserva(${r.id})">Editar</button>`
              : ''}

            ${r.estadoReserva === 'FINALIZADA'
              ? `<button class="btn btn-danger btn-sm" onclick="Views._deleteReserva(${r.id})">Eliminar</button>`
              : ''}
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
        Views._editReserva(null));
    }
    Views._reservaCache = { aulas, comisiones, comisionesForm };
  },

  _reservaCache: { aulas:[], comisiones:[], comisionesForm:[] },

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
${comisiones.map(c => `<option value="${c.id}" data-horario="${c.horario||''}" ${r.comision?.id===c.id?'selected':''}>${c.materiaNombre||'—'} · ${c.profesorNombre||'—'} · ${c.horario||'—'}</option>`).join('')}        </select></div>
      <div class="form-group"><label class="form-label">Fecha *</label>
        <input class="form-input" type="date" id="f-fecha" value="${r.fecha||''}"></div>
      <div class="form-row">
        <div class="form-group"><label class="form-label">Hora inicio *</label>
          <input class="form-input" type="time" id="f-hinicio" min="07:00" max="22:00" value="${r.horaInicio||''}"></div>
        <div class="form-group"><label class="form-label">Hora fin *</label>
          <input class="form-input" type="time" id="f-hfin" min="07:00" max="22:00" value="${r.horaFin||''}"></div>
      </div>`;
  },

  async _editReserva(id) {
    const { aulas, comisionesForm } = Views._reservaCache;
    let r = {};
    if (id) { try { r = await ReservaService.buscarId(id); } catch(e) { Toast.error(e.message); return; } }
    Modal.show(id?'Editar Reserva':'Nueva Reserva', this._reservaForm(r, aulas, comisionesForm), async () => {
      const dto = {
        id_aula:      parseInt(document.getElementById('f-aula').value),
        id_comision:  parseInt(document.getElementById('f-comision').value),
        fecha:        document.getElementById('f-fecha').value,
        horaInicio:   document.getElementById('f-hinicio').value,
        horaFin:      document.getElementById('f-hfin').value,
      };
      if (!dto.id_aula||!dto.id_comision||!dto.fecha||!dto.horaInicio||!dto.horaFin) { Toast.warning('Completá todos los campos.'); return; }
      const horarioLimites = { MAÑANA:['07:00','13:00'], TARDE:['13:00','18:00'], NOCHE:['18:00','22:00'] };
      const selOpt = document.getElementById('f-comision').selectedOptions[0];
      const horario = selOpt?.dataset?.horario;
      if (horario && horarioLimites[horario]) {
        const [min, max] = horarioLimites[horario];
        if (dto.horaInicio < min || dto.horaFin > max) {
          Toast.warning(`El horario de la comisión es ${horario.toLowerCase()} (${min}–${max}). La reserva debe estar dentro de ese rango.`);
          return;
        }
      }
      try {
        if (id) await ReservaService.modificar(id, dto); else await ReservaService.crear(dto);
        Toast.success(id?'Reserva actualizada.':'Reserva creada.');
        Modal.hide(); Views.reservas(document.getElementById('page-body'));
      } catch(e) {
        if (e.message && e.message.startsWith('CONFIRMACION_LIBERAR_AULA')) {
          Modal.show(
              'Conflicto con clase fija',
              `<p style="color:var(--clr-subtle)">Esta comisión tiene una clase fija registrada para este día.</p>
   <ul style="margin:14px 0 0 18px;color:var(--clr-subtle);line-height:2">
     <li><strong>Liberar</strong>: se libera el aula fija por este día y se registra la nueva reserva.</li>
     <li><strong>Mantener</strong>: no se realiza la nueva reserva; el aula fija queda sin cambios.</li>
   </ul>`,
              async () => {
                dto.liberarClaseFija = true;
                try {
                  if (id) await ReservaService.modificar(id, dto); else await ReservaService.crear(dto);
                  Toast.success(id ? 'Reserva actualizada.' : 'Reserva creada.');
                  Modal.hide(); Views.reservas(document.getElementById('page-body'));
                } catch (e2) {
                  Toast.error(e2.message);
                }
              },
              'Liberar clase fija',
              'btn-primary',
              'Mantener clase fija'
          );
        } else {
          Toast.error(e.message);
        }
      }
    });

    setTimeout(() => {
      const fComision = document.getElementById('f-comision');
      if (!fComision) return;
      const horarioLimites = { MAÑANA:['07:00','13:00'], TARDE:['13:00','18:00'], NOCHE:['18:00','22:00'] };
      const actualizarLimites = () => {
        const opt = fComision.selectedOptions[0];
        const horario = opt?.dataset?.horario;
        const limites = horario ? horarioLimites[horario] : ['07:00','22:00'];
        if (limites) {
          document.getElementById('f-hinicio').min = limites[0];
          document.getElementById('f-hinicio').max = limites[1];
          document.getElementById('f-hfin').min    = limites[0];
          document.getElementById('f-hfin').max    = limites[1];
        }
      };
      fComision.addEventListener('change', actualizarLimites);
      actualizarLimites();
    }, 0);
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

const isSoloProfe = isProfe && !isAdmin;

if (isSoloProfe) data = data.filter(a => a.estado === 'PENDIENTE');
    const estadoBadge = { PENDIENTE:'badge-pendiente', RESUELTO:'badge-resuelto', EN_REVISION:'badge-revision' };

    container.innerHTML = `
      <div class="page-header">
        <div class="page-header-text"><h2>Avisos</h2><p>${data.length} avisos ${isSoloProfe ? 'pendientes' : 'registrados'}</p></div>
        ${isSoloProfe ? `<button class="btn btn-primary" id="btn-nuevo-aviso">+ Nuevo Aviso</button>` : ''}
      </div>
      <div class="filters-bar">
        <div class="search-input-wrap">
          <input class="form-input" id="search-avisos" placeholder="Buscar por mensaje o aula…">
        </div>
        ${!isProfe ? `<select class="form-select" id="filter-estado-a" style="width:160px">
          <option value="">Todos los estados</option>
          <option>PENDIENTE</option><option>RESUELTO</option><option>EN_REVISION</option>
        </select>` : ''}
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
      if (!rows.length) { tbody.innerHTML=`<tr><td colspan="7">${emptyState('Sin avisos')}</td></tr>`; return; }
      tbody.innerHTML = rows.map(a => `
        <tr>
          <td><code>#${a.id}</code></td>
          <td>${a.aula?.nombre||'—'}</td>
          <td style="font-size:.8rem;color:var(--clr-subtle)">${a.usuario?.nombre||'—'}</td>
          <td style="max-width:220px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${a.mensaje||'—'}</td>
          <td>${a.fecha||'—'}</td>
          <td><span class="badge ${estadoBadge[a.estado]||'badge-user'}">${a.estado||'—'}</span></td>
          ${isAdmin || isProfe ? `<td class="td-actions">
            ${isProfe ? `<button class="btn btn-secondary btn-sm" onclick="Views._editAviso(${a.id})">Editar</button>` : ''}
            ${isAdmin ? `<button class="btn btn-secondary btn-sm" onclick="Views._editEstadoAviso(${a.id})">Estado</button>` : ''}
${isAdmin && a.estado === 'RESUELTO'
  ? `<button class="btn btn-danger btn-sm" onclick="Views._deleteAviso(${a.id})">Eliminar</button>`
  : ''}          </td>` : ''}
        </tr>`).join('');
    };

    render(data);
    const filter = () => {
      const q = document.getElementById('search-avisos').value.toLowerCase();
      const estadoEl = document.getElementById('filter-estado-a');
      const e = estadoEl ? estadoEl.value : '';
      render(data.filter(a =>
        (!q || (a.mensaje||'').toLowerCase().includes(q) || (a.aula?.nombre||'').toLowerCase().includes(q)) &&
        (!e || a.estado === e)));
    };
    document.getElementById('search-avisos').addEventListener('input', filter);
    if (document.getElementById('filter-estado-a')) document.getElementById('filter-estado-a').addEventListener('change', filter);
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
           <option value="EN_REVISION" ${a.estado === 'EN_REVISION' ? 'selected' : ''}>EN_REVISION</option>
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
    if (!AuthService.isAdmin()) { container.innerHTML = emptyState('Acceso denegado','Solo administradores.'); return; }
    let data = [];
    try { data = await UsuarioService.listar(); } catch(e) { container.innerHTML=`<p style="color:var(--clr-danger)">Error: ${e.message}</p>`; return; }

    const rolBadge = { ADMIN:'badge-admin', PROFESOR:'badge-profesor', ALUMNO:'badge-user' };

    container.innerHTML = `
      <div class="page-header">
        <div class="page-header-text"><h2>Usuarios</h2><p>${data.length} usuarios registrados</p></div>
        <button class="btn btn-primary" id="btn-nuevo-usuario">+ Nuevo Usuario</button>
      </div>
      <div class="filters-bar">
        <div class="search-input-wrap">
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
      if (!rows.length) { tbody.innerHTML=`<tr><td colspan="5">${emptyState('Sin resultados')}</td></tr>`; return; }
      tbody.innerHTML = rows.map(u => `
        <tr>
          <td><code>#${u.id||'—'}</code></td>
          <td><strong>${u.nombre}</strong></td>
          <td style="color:var(--clr-subtle)">${u.email}</td>
          <td><span class="badge ${rolBadge[u.rol]||'badge-user'}">${u.rol||'—'}</span></td>
          <td class="td-actions">
            <button class="btn btn-secondary btn-sm" onclick="Views._editUsuario(${u.id})">Editar</button>
            <button class="btn btn-danger btn-sm" onclick="Views._deleteUsuario(${u.id}, '${u.nombre}')">Eliminar</button>
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

      if (pass && pass.length < 8) {
        Toast.warning('La contraseña debe tener al menos 8 caracteres.');
        return;
      }

      if (pass && !/[A-Z]/.test(pass)) {
        Toast.warning('La contraseña debe contener al menos una mayúscula.');
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
    if (!AuthService.isAdmin()) { container.innerHTML = emptyState('Acceso denegado','Solo administradores.'); return; }
    let data = [], materias = [], usuarios = [], aulas = [];
    try {
        [data, materias, usuarios, aulas] = await Promise.all([
            ComisionService.listar(), MateriaService.listar(), UsuarioService.listar(), AulaService.listar()
        ]);
    } catch(e) { container.innerHTML=`<p style="color:var(--clr-danger)">Error: ${e.message}</p>`; return; }

    const profesores = usuarios.filter(u => u.rol === 'PROFESOR' || u.rol === 'ADMIN');
    const diasLabel = { LUNES:'Lunes', MARTES:'Martes', MIERCOLES:'Miércoles', JUEVES:'Jueves', VIERNES:'Viernes', SABADO:'Sábado' };

    container.innerHTML = `
      <div class="page-header">
        <div class="page-header-text"><h2>Comisiones</h2><p>${data.length} comisiones registradas</p></div>
        <button class="btn btn-primary" id="btn-nueva-comision">+ Nueva Comisión</button>
      </div>
      <div class="filters-bar">
        <div class="search-input-wrap">
          <input class="form-input" id="search-comisiones" placeholder="Buscar por materia o profesor…">
        </div>
      </div>
      <div class="table-wrap">
        <table>
          <thead><tr>
            <th>ID</th><th>Materia</th><th>Profesor</th><th>Cant. Alumnos</th><th>Horario</th><th>Inicio</th><th>Fin</th><th>Clase Fija</th><th>Acciones</th>
          </tr></thead>
          <tbody id="tbody-comisiones"></tbody>
        </table>
      </div>`;

    const render = (rows) => {
        const tbody = document.getElementById('tbody-comisiones');
        if (!rows.length) { tbody.innerHTML=`<tr><td colspan="9">${emptyState('Sin comisiones')}</td></tr>`; return; }

        const contadorPorMateria = {};
        rows.forEach(c => {
            const nombre = c.materiaNombre || '—';
            contadorPorMateria[nombre] = (contadorPorMateria[nombre] || 0) + 1;
        });

        const numeroPorMateria = {};
        const rowsConNumero = rows.map(c => {
            const nombre = c.materiaNombre || '—';
            numeroPorMateria[nombre] = (numeroPorMateria[nombre] || 0) + 1;
            const numero = contadorPorMateria[nombre] > 1 ? numeroPorMateria[nombre] : null;
            return { ...c, _numero: numero };
        });

        tbody.innerHTML = rowsConNumero.map(c => {
            const cf = c.claseFija;
            const cfTexto = cf
                ? (diasLabel[cf.diaSemana] || cf.diaSemana) + ' ' + cf.horaInicio + '–' + cf.horaFin + ' · ' + cf.aulaNombre
                : '—';
            const nombreMateria = c._numero
                ? (c.materiaNombre || '—') + ' <span class="badge badge-user">C' + c._numero + '</span>'
                : (c.materiaNombre || '—');
            return `
            <tr>
              <td><code>#${c.id}</code></td>
              <td><strong>${nombreMateria}</strong></td>
              <td>${c.profesorNombre||'—'}</td>
              <td>${c.cantAlumnos||'—'}</td>
              <td>${c.horario||'—'}</td>
              <td style="font-size:.8rem">${c.fechaInicio||'—'}</td>
              <td style="font-size:.8rem">${c.fechaFin||'—'}</td>
              <td style="font-size:.8rem">${cfTexto}</td>
              <td class="td-actions">
                <button class="btn btn-secondary btn-sm" onclick="Views._editComision(${c.id})">Editar</button>
                <button class="btn btn-danger btn-sm" onclick="Views._deleteComision(${c.id})">Eliminar</button>
              </td>
            </tr>`;
        }).join('');
    };

    render(data);
    document.getElementById('search-comisiones').addEventListener('input', e => {
      const q = e.target.value.toLowerCase();
      render(data.filter(c =>
        (c.materiaNombre||'').toLowerCase().includes(q) ||
        (c.profesorNombre||'').toLowerCase().includes(q)
      ));
    });
    Views._comisionCache = { materias, profesores, aulas };
    document.getElementById('btn-nueva-comision').addEventListener('click', () => Views._editComision(null));
  },

  _comisionCache: { materias:[], profesores:[], aulas:[] },

  _comisionForm(c = {}, materias = [], profesores = [], aulas = []) {
    const cf = c.claseFija;
    const tieneCF = !!cf;
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
        <input class="form-input" type="number" id="f-cant" value="${c.cantAlumnos||''}" min="1" placeholder="30"></div>
      <div class="form-group"><label class="form-label">Horario *</label>
        <select class="form-select" id="f-horario">
          <option value="">— Seleccionar —</option>
          <option value="MAÑANA" ${c.horario==='MAÑANA'?'selected':''}>Mañana (07:00–13:00)</option>
          <option value="TARDE"  ${c.horario==='TARDE' ?'selected':''}>Tarde (13:00–18:00)</option>
          <option value="NOCHE"  ${c.horario==='NOCHE' ?'selected':''}>Noche (18:00–22:00)</option>
        </select></div>
      <div class="form-row">
        <div class="form-group"><label class="form-label">Fecha inicio cursada *</label>
          <input class="form-input" type="date" id="f-finicio" value="${c.fechaInicio||''}"></div>
        <div class="form-group"><label class="form-label">Fecha fin cursada *</label>
          <input class="form-input" type="date" id="f-ffin" value="${c.fechaFin||''}"></div>
      </div>
      <div class="form-group" style="display:flex;align-items:center;gap:.5rem">
        <input type="checkbox" id="f-clase-fija" ${tieneCF?'checked':''}>
        <label class="form-label" for="f-clase-fija" style="margin:0">Confirmar clase fija</label>
      </div>
      <div id="clase-fija-fields" style="display:${tieneCF?'block':'none'};border:1px solid var(--clr-border);border-radius:8px;padding:1rem;margin-top:.5rem">
        <div class="form-group"><label class="form-label">Aula *</label>
          <select class="form-select" id="f-cf-aula">
            <option value="">— Seleccionar —</option>
            ${aulas.map(a=>`<option value="${a.id}" ${cf?.id_aula===a.id?'selected':''}>${a.nombre}</option>`).join('')}
          </select></div>
        <div class="form-group"><label class="form-label">Día *</label>
          <select class="form-select" id="f-cf-dia">
            <option value="">— Seleccionar —</option>
            <option value="LUNES"    ${cf?.diaSemana==='LUNES'    ?'selected':''}>Lunes</option>
            <option value="MARTES"   ${cf?.diaSemana==='MARTES'   ?'selected':''}>Martes</option>
            <option value="MIERCOLES"${cf?.diaSemana==='MIERCOLES'?'selected':''}>Miércoles</option>
            <option value="JUEVES"   ${cf?.diaSemana==='JUEVES'   ?'selected':''}>Jueves</option>
            <option value="VIERNES"  ${cf?.diaSemana==='VIERNES'  ?'selected':''}>Viernes</option>
            <option value="SABADO"   ${cf?.diaSemana==='SABADO'   ?'selected':''}>Sábado</option>
          </select></div>
        <div class="form-row">
          <div class="form-group"><label class="form-label">Hora inicio *</label>
            <input class="form-input" type="time" id="f-cf-hinicio" value="${cf?.horaInicio||''}"></div>
          <div class="form-group"><label class="form-label">Hora fin *</label>
            <input class="form-input" type="time" id="f-cf-hfin" value="${cf?.horaFin||''}"></div>
        </div>
      </div>`;
  },

   async _editComision(id) {
           const { materias, profesores, aulas } = Views._comisionCache;
           let c = {};
           if (id) { try { c = await ComisionService.buscarId(id); } catch(e) { Toast.error(e.message); return; } }

           Modal.show(id ? 'Editar Comisión' : 'Nueva Comisión', this._comisionForm(c, materias, profesores, aulas), async () => {

               const idMateria   = document.getElementById('f-materia').value;
               const idProfesor  = document.getElementById('f-profesor').value;
               const cantAlumnos = document.getElementById('f-cant').value;
               const horario     = document.getElementById('f-horario').value;
               const fechaInicio = document.getElementById('f-finicio').value;
               const fechaFin    = document.getElementById('f-ffin').value;

               if (!idMateria || !idProfesor || !cantAlumnos || !horario || !fechaInicio || !fechaFin) {
                   Toast.error("Por favor, completa todos los campos obligatorios (*)");
                   return;
               }

               const fi = new Date(fechaInicio), ff = new Date(fechaFin);
               const meses = (ff.getFullYear() - fi.getFullYear()) * 12 + (ff.getMonth() - fi.getMonth());
               if (meses < 2) { Toast.warning('La cursada debe durar al menos 2 meses.'); return; }
               if (meses > 6) { Toast.warning('La cursada no puede durar más de 6 meses.'); return; }

               const cfChecked = document.getElementById('f-clase-fija').checked;
               if (cfChecked) {
                   const cfAula    = document.getElementById('f-cf-aula').value;
                   const cfDia     = document.getElementById('f-cf-dia').value;
                   const cfHinicio = document.getElementById('f-cf-hinicio').value;
                   const cfHfin    = document.getElementById('f-cf-hfin').value;
                   if (!cfAula || !cfDia || !cfHinicio || !cfHfin) {
                       Toast.warning('Completá todos los campos de clase fija.');
                       return;
                   }
               }

               const dto = {
                   id_materia:  parseInt(idMateria),
                   id_profesor: parseInt(idProfesor),
                   cantAlumnos: parseInt(cantAlumnos),
                   horario,
                   fechaInicio,
                   fechaFin,
               };

               if (cfChecked) {
                   dto.claseFija = {
                       id_aula:     parseInt(document.getElementById('f-cf-aula').value),
                       diaSemana:   document.getElementById('f-cf-dia').value,
                       horaInicio:  document.getElementById('f-cf-hinicio').value,
                       horaFin:     document.getElementById('f-cf-hfin').value,
                   };
               } else {
                   dto.claseFija = null;
               }

               try {
                   let savedComision;
                   if (id) {
                       savedComision = await ComisionService.modificar(id, dto);
                   } else {
                       savedComision = await ComisionService.crear(dto);
                   }
                   Toast.success(id ? 'Comisión actualizada.' : 'Comisión creada.');
                   Modal.hide();
                   Views.comision(document.getElementById('page-body'));
               } catch(e) {
                   Toast.error(e.message);
               }
           });

           const fMateria = document.getElementById('f-materia');
           const fProfesor = document.getElementById('f-profesor');
           const fClaseFija = document.getElementById('f-clase-fija');
           const claseFijaFields = document.getElementById('clase-fija-fields');

           fClaseFija.addEventListener('change', () => {
               claseFijaFields.style.display = fClaseFija.checked ? 'block' : 'none';
           });

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
               fMateria.value = c.id_materia;
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
