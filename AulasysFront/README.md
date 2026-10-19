# AulaSys — Sprint 1

Frontend Angular para el backend Spring Boot de `../Aulas`. Implementa exclusivamente la base de desarrollo, acceso, permisos y administración del primer sprint.

Mantiene el estilo simple del frontend original de `Aulas/src/main/resources/static`: fondo claro, menú lateral, botones azules y tablas. Al ingresar se muestra el listado de aulas.

## Ejecutar

Requisitos: Node.js 24 (verificado con 24.19.0), npm, JDK 21 y MySQL 8.

1. Iniciar MySQL y disponer de la base `gestion_aulas`. Usar la configuración de `Aulas/src/main/resources/application.properties` o sobrescribirla con `SPRING_DATASOURCE_URL`, `SPRING_DATASOURCE_USERNAME` y `SPRING_DATASOURCE_PASSWORD`.
2. Iniciar el backend en una terminal:

   ```powershell
   cd Aulas
   .\mvnw.cmd spring-boot:run
   ```

3. Iniciar el frontend en otra terminal:

   ```powershell
   cd AulasysFront
   npm ci
   npm start
   ```

4. Abrir http://localhost:4200. El proxy de desarrollo reenvía `/api/**` a http://localhost:8080. Si cambia el puerto del backend, editar `proxy.conf.json` y reiniciar Angular.

Las cuentas de prueba existentes en `CustomUserDetailsService` son `admin`, `profesor` y `alumno`, todas con contraseña `Usuario1`. Las cuentas creadas en Usuarios ingresan con su correo y su contraseña. Las cuentas de prueba no están guardadas en MySQL ni aparecen en el listado de usuarios.

## Alcance entregado

| Historia | Implementación                                                                                                |
| -------- | ------------------------------------------------------------------------------------------------------------- |
| HU-01    | Angular standalone, TypeScript estricto, rutas con carga diferida, proxy local y pruebas Vitest.              |
| HU-02    | Navegación por rol con el estilo original y páginas de acceso restringido/no encontrado.                      |
| HU-03    | HttpClient tipado, interceptor de autenticación y errores; estados de carga, reintento, vacío y confirmación. |
| HU-04    | Inicio mediante `GET /api/usuarios/me`, cierre de sesión y reingreso cuando la API devuelve 401.              |
| HU-05    | Guards, navegación y acciones según ADMIN, PROFESOR o ALUMNO; autorización reforzada en Spring Security.      |
| HU-08    | Consulta de aulas con filtros combinables por nombre, tipo, capacidad mínima y equipamiento.                  |
| HU-09    | Alta, modificación y eliminación confirmada de aulas.                                                         |
| HU-10    | Consulta, búsqueda, filtro de laboratorio y administración de materias.                                       |
| HU-11    | Alta, modificación, roles y eliminación protegida de usuarios, conservando datos académicos.                  |

No se incluyen pantallas de comisiones, asignación de materias a profesores, clases fijas, reservas, avisos, historial, perfil propio, JWT ni calendario. Esas funciones corresponden a los próximos sprints.

## Permisos

| Función                                | Administrador | Profesor | Alumno |
| -------------------------------------- | ------------- | -------- | ------ |
| Iniciar/cerrar sesión                  | Sí            | Sí       | Sí     |
| Consultar y filtrar aulas              | Sí            | Sí       | Sí     |
| Crear, editar y eliminar aulas         | Sí            | No       | No     |
| Consultar y filtrar materias           | Sí            | Sí       | Sí     |
| Crear, editar y eliminar materias      | Sí            | No       | No     |
| Consultar y administrar usuarios/roles | Sí            | No       | No     |

## Autenticación y datos

- Se mantiene HTTP Basic del backend. Las credenciales se guardan solamente en memoria, sin `localStorage` ni `sessionStorage`. Recargar/cerrar la pestaña requiere iniciar sesión otra vez. El cierre elimina el estado local; el servidor es stateless y no tiene endpoint de logout.
- El interceptor agrega Authorization sólo a rutas relativas `/api/`. El rol se obtiene de la API, no del nombre escrito en el login. Para un despliegue remoto, servir la aplicación y la API por HTTPS bajo el mismo origen.
- Un 401 durante una sesión obliga a ingresar nuevamente. Un 403 informa falta de permisos. Los mensajes de negocio se muestran en los formularios y las respuestas internas del servidor se sustituyen por mensajes comprensibles.
- Los formularios respetan las restricciones del backend: nombres de hasta 20 caracteres, capacidad entera entre 1 y 100, tipos definidos en `Tipo` y contraseña de al menos 8 caracteres con una mayúscula.
- La edición de usuarios omite `materiasIds`, para conservar sus asignaciones. Una contraseña vacía en edición conserva la anterior. No se permite borrar la cuenta propia ni cambiar su propio rol. Cambiar correo o contraseña de la cuenta autenticada requiere volver a ingresar.
- Cambiar un profesor de rol conserva la entidad Profesor, su identificador, materias, comisiones, clases y reservas. Al volver al rol PROFESOR se reutiliza la misma entidad. Los permisos efectivos siempre dependen del rol actual del Usuario.
- El borrado de usuarios con materias, comisiones o avisos se bloquea. También se bloquea borrar materias vinculadas y aulas con clases fijas, reservas o avisos.

## Cambios necesarios en el backend

Se limitaron a los requisitos de este sprint:

- `SecurityConfig`: restringe el listado/detalle de usuarios y `PUT /api/materias/{id}` a ADMIN; devuelve errores 401/403 comprensibles.
- `UsuarioController`: impide borrar la cuenta propia, cambiar su propio rol y elevar permisos mediante el endpoint existente `/me`.
- `UsuarioService` y `Profesor`: el cambio de rol deja de borrar la historia académica; las altas y bajas son transaccionales; se elimina el borrado en cascada de Profesor hacia Usuario.
- `AulaService` y `MateriaService`: validan relaciones antes de borrar. Se agregan las consultas de existencia necesarias a los repositorios.
- Validación de roles/tipo de aula y manejo de 404, conflictos de integridad y cuerpos inválidos.

## Organización

```text
src/app/
  core/             Modelos, API, autenticación, interceptor y guards
  layout/           Navegación y estructura visual
  shared/           Estado de listas/CRUD, modal y validaciones
  features/
    login/          Acceso
    home/           Estados de navegación
    aulas/          Consulta, filtros y CRUD
    materias/       Consulta y CRUD
    usuarios/       Administración de cuentas y roles
```

## Verificación

```powershell
# Desde AulasysFront
npm test -- --watch=false
npm run build

# Desde Aulas; estas pruebas no requieren MySQL
.\mvnw.cmd test "-Dtest=UsuarioServiceTest,SprintOneSecurityTest"

# Suite Java completa: requiere MySQL configurado
.\mvnw.cmd test
```

La compilación genera `dist/AulasysFront/browser`. El proxy de Angular sólo funciona con `npm start`; un servidor de producción debe reenviar `/api/**` al backend y resolver las rutas de Angular con `index.html`.

Verificado el 14/10/2026:

- 21 pruebas Angular: autenticación, guards, contrato de la API, errores, filtros, validaciones reactivas y acciones ocultas para alumno.
- 17 pruebas Java nuevas: permisos HTTP de los tres roles, protección de la cuenta propia, conservación de asignaciones/identificadores y bajas protegidas.
- Inicio de la aplicación Spring Boot con MySQL 8 en una instancia temporal independiente. Integración real de login, CRUD, cambio de roles, conservación de una comisión y bloqueo de borrado con datos vinculados.
- La suite Java completa tiene tres fallos en las pruebas preexistentes `ReservaServiceTest`: preparan una reserva para hoy a una hora que puede haber pasado. No se modificó esa funcionalidad del Sprint 2. `AulasApplicationTests` pasó con la base temporal.

### Recorrido manual del Sprint 1

1. Entrar como admin, crear un aula, modificar su capacidad y combinar los cuatro filtros.
2. Crear/editar una materia, cambiar su requisito de laboratorio y confirmar una eliminación de un registro sin vínculos.
3. Crear un usuario, editar su nombre con contraseña vacía e ingresar con la contraseña original.
4. Con un profesor que ya tiene datos académicos, cambiar su rol y volver a PROFESOR; comprobar que conserva sus asignaciones y que no se puede eliminar mientras tenga vínculos.
5. Cerrar sesión e ingresar como profesor/alumno: sólo aparecen Aulas y Materias, sin acciones de edición. `/usuarios` muestra acceso restringido.
6. Probar contraseña inválida, backend detenido y enlace directo sin sesión: debe aparecer un mensaje comprensible o el login, sin datos de otra cuenta.
