// ============================================================
//  api/services.js  –  Servicios para todos los endpoints
// ============================================================

import { http, ENDPOINTS } from './config.js';

// ─── AULAS ───────────────────────────────────────────────────
export const AulaService = {
  listar:   ()        => http.get(ENDPOINTS.aulas),
  buscarId: (id)      => http.get(`${ENDPOINTS.aulas}/${id}`),
  crear:    (aula)    => http.post(ENDPOINTS.aulas, aula),
  modificar:(id, dto) => http.put(`${ENDPOINTS.aulas}/${id}`, dto),
  eliminar: (id)      => http.delete(`${ENDPOINTS.aulas}/${id}`),
};

// ─── AVISOS ──────────────────────────────────────────────────
export const AvisoService = {
  listar:   ()          => http.get(ENDPOINTS.avisos),
  buscarId: (id)        => http.get(`${ENDPOINTS.avisos}/${id}`),
  crear:    (aviso)     => http.post(ENDPOINTS.avisos, aviso),
  modificar:(id, dto)   => http.put(`${ENDPOINTS.avisos}/${id}`, dto),
  eliminar: (id)        => http.delete(`${ENDPOINTS.avisos}/${id}`),
};

// ─── MATERIAS ────────────────────────────────────────────────
export const MateriaService = {
  listar:   ()           => http.get(ENDPOINTS.materias),
  buscarId: (id)         => http.get(`${ENDPOINTS.materias}/${id}`),
  crear:    (materia)    => http.post(ENDPOINTS.materias, materia),
  modificar:(id, dto)    => http.put(`${ENDPOINTS.materias}/${id}`, dto),
  eliminar: (id)         => http.delete(`${ENDPOINTS.materias}/${id}`),
};

// ─── PROFESOR-MATERIA ────────────────────────────────────────
export const ProfesorMateriaService = {
  listar:   ()         => http.get(ENDPOINTS.profesorMateria),
  buscarId: (id)       => http.get(`${ENDPOINTS.profesorMateria}/${id}`),
  crear:    (dto)      => http.post(ENDPOINTS.profesorMateria, dto),
  modificar:(id, dto)  => http.put(`${ENDPOINTS.profesorMateria}/${id}`, dto),
  eliminar: (id)       => http.delete(`${ENDPOINTS.profesorMateria}/${id}`),
};

// ─── RESERVAS ────────────────────────────────────────────────
export const ReservaService = {
  listar:   ()           => http.get(ENDPOINTS.reservas),
  buscarId: (id)         => http.get(`${ENDPOINTS.reservas}/${id}`),
  /**
   * @param {Object} reserva - Mapea al modelo Reserva.java:
   *   { profesor: {id}, aula: {id}, materia: {id},
   *     fecha: "YYYY-MM-DD", horaInicio: "HH:MM", horaFin: "HH:MM" }
   */
  crear:    (reserva)    => http.post(ENDPOINTS.reservas, reserva),
  modificar:(id, dto)    => http.put(`${ENDPOINTS.reservas}/${id}`, dto),
  eliminar: (id)         => http.delete(`${ENDPOINTS.reservas}/${id}`),
};

// ─── USUARIOS ────────────────────────────────────────────────
export const UsuarioService = {
  listar:   ()           => http.get(ENDPOINTS.usuarios),
  buscarId: (id)         => http.get(`${ENDPOINTS.usuarios}/${id}`),
  crear:    (usuario)    => http.post(ENDPOINTS.usuarios, usuario),
  modificar:(id, dto)    => http.put(`${ENDPOINTS.usuarios}/${id}`, dto),
  eliminar: (id)         => http.delete(`${ENDPOINTS.usuarios}/${id}`),
};
