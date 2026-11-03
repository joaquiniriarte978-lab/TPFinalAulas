export const ROUTE_SEGMENTS = {
  login: 'login',
  inicio: 'inicio',
  aulas: 'aulas',
  materias: 'materias',
  usuarios: 'usuarios',
  perfil: 'perfil',
  profesores: 'profesores',
  comisiones: 'comisiones',
  reservas: 'reservas',
  avisos: 'avisos',
  clases: 'clases',
  accessDenied: 'sin-acceso',
} as const;

export const ROUTE_COMMANDS = {
  login: [`/${ROUTE_SEGMENTS.login}`],
  inicio: [`/${ROUTE_SEGMENTS.inicio}`],
  aulas: [`/${ROUTE_SEGMENTS.aulas}`],
  materias: [`/${ROUTE_SEGMENTS.materias}`],
  usuarios: [`/${ROUTE_SEGMENTS.usuarios}`],
  perfil: [`/${ROUTE_SEGMENTS.perfil}`],
  profesores: [`/${ROUTE_SEGMENTS.profesores}`],
  comisiones: [`/${ROUTE_SEGMENTS.comisiones}`],
  reservas: [`/${ROUTE_SEGMENTS.reservas}`],
  avisos: [`/${ROUTE_SEGMENTS.avisos}`],
  clases: [`/${ROUTE_SEGMENTS.clases}`],
  accessDenied: [`/${ROUTE_SEGMENTS.accessDenied}`],
} as const;
