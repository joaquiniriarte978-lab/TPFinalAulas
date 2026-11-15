# Graph Report - TPFinalAulas  (2026-11-11)

## Corpus Check
- Corpus is ~35,461 words - fits in a single context window. You may not need a graph.

## Summary
- 1039 nodes · 2522 edges · 55 communities (40 shown, 15 thin omitted)
- Extraction: 93% EXTRACTED · 7% INFERRED · 0% AMBIGUOUS · INFERRED: 169 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- Reglas de Agenda y Comisiones
- Informe de Auditoría
- Config Angular (angular.json)
- Clases Controller y Entidades
- Dependencias Frontend (package.json)
- Aviso Controller
- Rutas y Guards Angular
- Pantallas de Listado Angular
- Materia Controller
- Hallazgos y Excepciones/Roles
- Aula Controller
- Aviso: DTO, Estado y Repo
- Comisión y ClaseFija Controllers
- AuthService y Usuario Client
- DTOs de Request/Entidades
- DTOs Reserva y DiaSemana
- Aula y Aviso (Frontend)
- Pantallas Aviso/Clase/Profesor
- Comisión Client Angular
- Repositorios JPA
- Tests de Seguridad y Servicios
- SecurityConfig y BCrypt
- Entidades JPA Núcleo
- App Angular e Interceptor
- Dominio: ClaseFija y Comisión
- Usuario Controller
- Profesor/Usuario Servicio
- READMEs y Arquitectura
- Reserva y Repositorio
- Usuario UserDetails
- Cambio de Aula y Turnos
- Profesor Controller
- UsuarioServiceTest
- UserDetailsService
- Aula Filters y Errores UI
- Reserva Client Angular
- Propuestas SOLID/GRASP
- Login, Perfil y Auth Basic
- Sprint 2 y Reservas
- Esquema SQL
- Aula DTO y Tipo
- Gestión de Usuarios UI
- Comisión y Horario
- Cliente Legacy: Services
- Cliente Legacy: UI
- Materia Client Angular
- Materia List UI
- AulasApplication
- TimeConfig (Clock)
- Cliente Legacy: Config
- Profesor Client Angular
- Maven (pom)

## God Nodes (most connected - your core abstractions)
1. `ReservaServiceTest` - 48 edges
2. `@angular/core` - 36 edges
3. `Usuario` - 33 edges
4. `Aula` - 29 edges
5. `AgendaRules` - 29 edges
6. `Materia` - 26 edges
7. `ReservaService` - 26 edges
8. `ResourceNotFoundException` - 24 edges
9. `@angular/router` - 23 edges
10. `AvisoService` - 22 edges

## Surprising Connections (you probably didn't know these)
- `Login` --semantically_similar_to--> `Legacy login page`  [INFERRED] [semantically similar]
  AulasysFront/src/app/auth/features/login/login.ts → Aulas/src/main/resources/static/index.html
- `Shell` --semantically_similar_to--> `Legacy sidebar navigation (clases, aulas, materias, reservas, avisos, usuarios, comision, perfil)`  [INFERRED] [semantically similar]
  AulasysFront/src/app/shared/shell/shell.ts → Aulas/src/main/resources/static/index.html
- `Frontend organized by modules (data-access + features)` --conceptually_related_to--> `AulaList`  [INFERRED]
  graphify-out/converted/Auditoria_Aulasys_Metodologia_II_d402cde9.md → AulasysFront/src/app/aulas/features/aula-list/aula-list.ts
- `ClaseList` --shares_data_with--> `ClasesController`  [INFERRED]
  AulasysFront/src/app/clases/features/clase-list/clase-list.ts → graphify-out/converted/Auditoria_Aulasys_Metodologia_II_d402cde9.md
- `ClaseList` --implements--> `SCRUM-36 Consulta del alumno`  [INFERRED]
  AulasysFront/src/app/clases/features/clase-list/clase-list.ts → SPRINT-2.md

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Admin CRUD list screens sharing filter table modal delete-confirm pattern** — aulasysfront_src_app_aulas_features_aula_list_aula_list_aulalist, aulasysfront_src_app_materias_features_materia_list_materia_list_materialist, aulasysfront_src_app_usuarios_features_usuario_list_usuario_list_usuariolist [INFERRED 0.85]
- **Agenda flow: comision clase fija, reserva with aula change, clases query** — aulasysfront_src_app_comisiones_features_comision_list_comision_list_comisionlist, aulasysfront_src_app_reservas_features_reserva_list_reserva_list_reservalist, aulasysfront_src_app_clases_features_clase_list_clase_list_claselist [INFERRED 0.85]
- **Shared UI building blocks used across feature screens** — aulasysfront_src_app_shared_modal_modal_appmodal, aulasysfront_src_app_shared_field_error_field_error_appfielderror, aulasysfront_src_app_shared_list_status_list_status_applistatus, aulasysfront_src_app_shared_shell_shell_shell [INFERRED 0.75]
- **Cinco propuestas de mejora de diseno (P1-P5)** — auditoria_auditoria_aulasys_metodologia_ii_p1_reservaservice_srp, auditoria_auditoria_aulasys_metodologia_ii_p2_agendaconsulta, auditoria_auditoria_aulasys_metodologia_ii_p3_reglas_strategy, auditoria_auditoria_aulasys_metodologia_ii_p4_errores_codigo, auditoria_auditoria_aulasys_metodologia_ii_p5_estados_aviso [EXTRACTED 1.00]
- **Tecnicas de caja negra para disenar condiciones de prueba** — auditoria_auditoria_aulasys_metodologia_ii_particiones_equivalencia, auditoria_auditoria_aulasys_metodologia_ii_valores_limite, auditoria_auditoria_aulasys_metodologia_ii_causa_efecto [EXTRACTED 1.00]
- **Principios y patrones de diseno aplicados en las propuestas** — auditoria_auditoria_aulasys_metodologia_ii_solid, auditoria_auditoria_aulasys_metodologia_ii_grasp, auditoria_auditoria_aulasys_metodologia_ii_strategy_pattern, auditoria_auditoria_aulasys_metodologia_ii_state_pattern [INFERRED 0.75]

## Communities (55 total, 15 thin omitted)

### Community 0 - "Reglas de Agenda y Comisiones"
Cohesion: 0.10
Nodes (6): ComisionRequestDTO, ClaseFijaLiberadaRepository, AgendaRules, ClaseFijaService, ComisionService, ReservaService

### Community 1 - "Informe de Auditoría"
Cohesion: 0.07
Nodes (33): Auditoria de diseno de software: Aulasys (informe), Actores: Administrador, Profesor, Alumno, AgendaConsultaService / interfaz AgendaConsulta (propuesta), Arquitectura cliente-servidor monolito en capas (Angular + Spring Boot + MySQL), Aulasys (sistema de gestion y reserva de aulas), Aviso (reporte de problema en aula), AvisoService.java (cambiarEstado), Backend Java 21 Spring Boot 4.0.6 REST API (+25 more)

### Community 2 - "Config Angular (angular.json)"
Cohesion: 0.05
Nodes (41): build, serve, test, architect, prefix, projectType, root, schematics (+33 more)

### Community 3 - "Clases Controller y Entidades"
Cohesion: 0.11
Nodes (4): Clase, ClasesController, ReservaServiceTest, Tiempo

### Community 4 - "Dependencias Frontend (package.json)"
Cohesion: 0.07
Nodes (37): dependencies, @angular/common@^22.1.0, @angular/compiler@^22.1.0, @angular/core@^22.1.0, @angular/forms@^22.1.0, @angular/platform-browser@^22.1.0, @angular/router@^22.1.0, rxjs@~7.8.0 (+29 more)

### Community 5 - "Aviso Controller"
Cohesion: 0.11
Nodes (6): AvisoController, ReservaController, AvisoRequestDTO, AvisoResponseDTO, ReservaRequestDTO, ReservaResponseDTO

### Community 6 - "Rutas y Guards Angular"
Cohesion: 0.11
Nodes (17): ROUTE_COMMANDS, ROUTE_SEGMENTS, aulaRoutes, authRoutes, adminGuard(), authGuard(), safeReturnUrl(), guestGuard() (+9 more)

### Community 7 - "Pantallas de Listado Angular"
Cohesion: 0.22
Nodes (11): Materia, Profesor, FieldError, ListStatus, Modal, collection(), crudState(), fechaHoy() (+3 more)

### Community 8 - "Materia Controller"
Cohesion: 0.11
Nodes (3): MateriaController, Materia, MateriaService

### Community 9 - "Hallazgos y Excepciones/Roles"
Cohesion: 0.15
Nodes (6): Estado actual del codigo (hallazgos), ResourceNotFoundException, Rol, ADMIN, ALUMNO, PROFESOR

### Community 10 - "Aula Controller"
Cohesion: 0.11
Nodes (3): AulaController, Aula, AulaService

### Community 11 - "Aviso: DTO, Estado y Repo"
Cohesion: 0.14
Nodes (8): AvisoEstadoDTO, Aviso, Estado, EN_REVISION, PENDIENTE, RESUELTO, AvisoRepository, AvisoService

### Community 12 - "Comisión y ClaseFija Controllers"
Cohesion: 0.13
Nodes (4): ClaseFijaController, ComisionController, ClaseFijaDTO, ComisionResponseDTO

### Community 13 - "AuthService y Usuario Client"
Cohesion: 0.15
Nodes (8): AuthService, UsuarioClient, PerfilInput, Rol, ROLES, Usuario, UsuarioInput, rxjs

### Community 14 - "DTOs de Request/Entidades"
Cohesion: 0.16
Nodes (4): AulaRequestDTO, MateriaRequestDTO, MateriaResponseDTO, PerfilRequestDTO

### Community 16 - "DTOs Reserva y DiaSemana"
Cohesion: 0.13
Nodes (8): DiaSemana, JUEVES, LUNES, MARTES, MIERCOLES, SABADO, VIERNES, ClaseFijaRepository

### Community 17 - "Aula y Aviso (Frontend)"
Cohesion: 0.13
Nodes (8): Aula, AulaInput, AulaClient, TipoAula, TIPOS_AULA, Aviso, AvisoInput, AvisoClient

### Community 18 - "Pantallas Aviso/Clase/Profesor"
Cohesion: 0.11
Nodes (10): AvisoList, Aula efectiva (RESERVA puntual vs clase semanal), ClaseList, ProfesorList, app-list-status component (loading/error/empty), app-modal dialog component, Shell, Skip-to-content accessibility link (+2 more)

### Community 19 - "Comisión Client Angular"
Cohesion: 0.13
Nodes (9): ClaseFija, ClaseFijaInput, ComisionClient, Comision, ComisionInput, DIAS, DiaSemana, Turno (+1 more)

### Community 20 - "Repositorios JPA"
Cohesion: 0.17
Nodes (4): AulaRepository, ComisionRepository, MateriaRepository, ProfesorService

### Community 24 - "App Angular e Interceptor"
Cohesion: 0.16
Nodes (8): App, appConfig, appRoutes, Clase, ClaseClient, apiErrorMessage(), apiInterceptor(), @angular/common

### Community 25 - "Dominio: ClaseFija y Comisión"
Cohesion: 0.15
Nodes (11): Clase fija (weekly fixed class assignment), ComisionList, Aula entity, Aviso entity, ClaseFija entity, Comision entity, Materia entity, Profesor entity (+3 more)

### Community 27 - "Usuario Controller"
Cohesion: 0.26
Nodes (3): UsuarioController, UsuarioRequestDTO, UsuarioResponseDTO

### Community 28 - "Profesor/Usuario Servicio"
Cohesion: 0.22
Nodes (3): Profesor, ProfesorRepository, UsuarioService

### Community 29 - "READMEs y Arquitectura"
Cohesion: 0.15
Nodes (15): Legacy login page, Legacy sidebar navigation (clases, aulas, materias, reservas, avisos, usuarios, comision, perfil), Legacy static client (index.html), Dev proxy /api/** to backend :8080, AulaSys Angular client README, Role permissions matrix (Administrador/Profesor/Alumno), Angular Signal Forms validation, Role-based sidebar menu (+7 more)

### Community 30 - "Reserva y Repositorio"
Cohesion: 0.19
Nodes (5): EstadoReserva, FINALIZADA, RESERVADA, Reserva, ReservaRepository

### Community 32 - "Cambio de Aula y Turnos"
Cohesion: 0.19
Nodes (8): Turnos (mañana 06-13, tarde 13-19, noche 19-23:59; no domingos), Confirm aula change (release fixed class for one date), ReservaList, Black-box test design (equivalence partitions, boundary values, cause-effect; CP01-CP44), GlobalExceptionHandler, CONFIRMACION_LIBERAR_AULA: 400 response prefix triggering confirm modal, ClaseFijaLiberada entity, SCRUM-30 Cambio de aula

### Community 33 - "Profesor Controller"
Cohesion: 0.23
Nodes (3): MateriasInput, ProfesorController, ProfesorResponseDTO

### Community 36 - "Aula Filters y Errores UI"
Cohesion: 0.17
Nodes (4): Aula filters (name, tipo, min capacity, equipamiento), AulaList, AccessDenied, NotFound

### Community 37 - "Reserva Client Angular"
Cohesion: 0.23
Nodes (3): ReservaClient, Reserva, ReservaInput

### Community 38 - "Propuestas SOLID/GRASP"
Cohesion: 0.17
Nodes (8): AgendaRules, Auditoría de diseño de software: Aulasys, AvisoService, ClasesController, Frontend organized by modules (data-access + features), ReservaService, SOLID and GRASP principles applied, Strategy pattern

### Community 39 - "Login, Perfil y Auth Basic"
Cohesion: 0.18
Nodes (7): Demo accounts (admin, profesor, alumno), Login, app-field-error component, Perfil, HTTP Basic auth, stateless, BCrypt, RoleHierarchy (ADMIN > PROFESOR > ALUMNO), SCRUM-18 Perfil

### Community 40 - "Sprint 2 y Reservas"
Cohesion: 0.18
Nodes (10): Reserva historial (FINALIZADA) and deletion, Cancel reservation restores fixed class or is rejected, Sprint 2 scope document, SCRUM-31 Cancelar reserva, SCRUM-25 Comisiones, SCRUM-36 Consulta del alumno, SCRUM-27 Consulta de reservas, SCRUM-28 Crear reserva (+2 more)

### Community 41 - "Esquema SQL"
Cohesion: 0.42
Nodes (10): aula, aviso, clase_fija, clase_fija_liberada, comision, materia, profesor, profesor_materias (+2 more)

### Community 43 - "Aula DTO y Tipo"
Cohesion: 0.22
Nodes (7): AulaResponseDTO, Tipo, AULA, LABORATORIO, LABORATORIO_IDIOMAS, LABORATORIO_TEXTIL, SUM

### Community 44 - "Gestión de Usuarios UI"
Cohesion: 0.27
Nodes (4): Self-account protection (cannot delete or change own role), UsuarioList, Profesor with current/future comisiones cannot change role or lose materias, SCRUM-23 Usuarios

### Community 45 - "Comisión y Horario"
Cohesion: 0.22
Nodes (5): Comision, Horario, MAÑANA, NOCHE, TARDE

### Community 46 - "Cliente Legacy: Services"
Cohesion: 0.22
Nodes (8): AulaService, AvisoService, ClaseFijaService, ComisionService, MateriaService, ProfesorService, ReservaService, UsuarioService

### Community 47 - "Cliente Legacy: UI"
Cohesion: 0.29
Nodes (4): App, Modal, Toast, Views

### Community 52 - "Cliente Legacy: Config"
Cohesion: 0.50
Nodes (3): AuthService, ENDPOINTS, http

## Knowledge Gaps
- **50 isolated node(s):** `com.TrabajoFinal:Aulas`, `LUNES`, `MARTES`, `MIERCOLES`, `JUEVES` (+45 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 295 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **15 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `P4. Errores con codigo claro` connect `Informe de Auditoría` to `Hallazgos y Excepciones/Roles`, `Pantallas de Listado Angular`?**
  _High betweenness centrality (0.374) - this node is a cross-community bridge._
- **What connects `com.TrabajoFinal:Aulas`, `LUNES`, `MARTES` to the rest of the system?**
  _50 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Reglas de Agenda y Comisiones` be split into smaller, more focused modules?**
  _Cohesion score 0.09562841530054644 - nodes in this community are weakly interconnected._
- **Why does `ReservaService` connect `Reglas de Agenda y Comisiones` to `Clases Controller y Entidades`, `Aviso Controller`, `Hallazgos y Excepciones/Roles`, `DTOs Reserva y DiaSemana`, `Repositorios JPA`, `Controllers REST y Estado`, `Reserva y Repositorio`?**
  _High betweenness centrality (0.079) - this node is a cross-community bridge._
- **Should `Informe de Auditoría` be split into smaller, more focused modules?**
  _Cohesion score 0.06826241134751773 - nodes in this community are weakly interconnected._
- **Why does `@angular/core` connect `Pantallas de Listado Angular` to `Dependencias Frontend (package.json)`, `Reserva Client Angular`, `Rutas y Guards Angular`, `AuthService y Usuario Client`, `Aula y Aviso (Frontend)`, `Comisión Client Angular`, `App Angular e Interceptor`?**
  _High betweenness centrality (0.075) - this node is a cross-community bridge._
- **Should `Config Angular (angular.json)` be split into smaller, more focused modules?**
  _Cohesion score 0.04994192799070848 - nodes in this community are weakly interconnected._