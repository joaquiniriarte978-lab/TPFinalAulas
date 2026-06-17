

const AulaService = {
  listar:    ()         => http.get(ENDPOINTS.aulas),
  buscarId:  (id)       => http.get(`${ENDPOINTS.aulas}/${id}`),
  crear:     (dto)      => http.post(ENDPOINTS.aulas, dto),
  modificar: (id, dto)  => http.put(`${ENDPOINTS.aulas}/${id}`, dto),
  eliminar:  (id)       => http.delete(`${ENDPOINTS.aulas}/${id}`),
};

const AvisoService = {
  listar:        ()        => http.get(ENDPOINTS.avisos),
  buscarId:      (id)      => http.get(`${ENDPOINTS.avisos}/${id}`),
  crear:         (dto)     => http.post(ENDPOINTS.avisos, dto),
  modificar:     (id, dto) => http.put(`${ENDPOINTS.avisos}/${id}`, dto),
  cambiarEstado: (id, dto) => http.put(`${ENDPOINTS.avisos}/${id}/estado`, dto),
  eliminar:      (id)      => http.delete(`${ENDPOINTS.avisos}/${id}`),
};

const MateriaService = {
  listar:    ()         => http.get(ENDPOINTS.materias),
  buscarId:  (id)       => http.get(`${ENDPOINTS.materias}/${id}`),
  crear:     (dto)      => http.post(ENDPOINTS.materias, dto),
  modificar: (id, dto)  => http.put(`${ENDPOINTS.materias}/${id}`, dto),
  eliminar:  (id)       => http.delete(`${ENDPOINTS.materias}/${id}`),
};

const ComisionService = {
    listar:        ()        => http.get(ENDPOINTS.comisiones),
    misComisiones: ()        => http.get(`${ENDPOINTS.comisiones}/mis-comisiones`),
    buscarId:      (id)      => http.get(`${ENDPOINTS.comisiones}/${id}`),
    crear:         (dto)     => http.post(ENDPOINTS.comisiones, dto),
    modificar:     (id, dto) => http.put(`${ENDPOINTS.comisiones}/${id}`, dto),
    eliminar:      (id)      => http.delete(`${ENDPOINTS.comisiones}/${id}`),
};

const ReservaService = {
  listar:    ()         => http.get(ENDPOINTS.reservas),
  buscarId:  (id)       => http.get(`${ENDPOINTS.reservas}/${id}`),
  crear:     (dto)      => http.post(ENDPOINTS.reservas, dto),
  modificar: (id, dto)  => http.put(`${ENDPOINTS.reservas}/${id}`, dto),
  eliminar:  (id)       => http.delete(`${ENDPOINTS.reservas}/${id}`),
  listarPorMateria: (idMateria) => http.get(`${ENDPOINTS.reservas}/materia/${idMateria}`),
};

const UsuarioService = {
  listar:    ()         => http.get(ENDPOINTS.usuarios),
  buscarId:  (id)       => http.get(`${ENDPOINTS.usuarios}/${id}`),
  crear:     (dto)      => http.post(ENDPOINTS.usuarios, dto),
  modificar: (id, dto)  => http.put(`${ENDPOINTS.usuarios}/${id}`, dto),
  eliminar:  (id)       => http.delete(`${ENDPOINTS.usuarios}/${id}`),
  miPerfil: () => http.get(`${ENDPOINTS.usuarios}/me`),
  modificarPerfil: (dto)   => http.put(`${ENDPOINTS.usuarios}/me`, dto),
};


const ProfesorService = {
  listar: () =>
    http.get(`${API_BASE_URL}/api/profesores`),

  buscarPorMateria: (idMateria) =>
    http.get(`${API_BASE_URL}/api/profesores/materia/${idMateria}`),

  asignarMateria: (idProfesor, idMateria) =>
    http.put(`${API_BASE_URL}/api/profesores/${idProfesor}/materia/${idMateria}`),
};