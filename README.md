# Gestión de Aulas — AulaSys

Trabajo Práctico Final — **Programación IV**
Tecnicatura Universitaria en Programación · Universidad Tecnológica Nacional (UTN)
Profesor: Nicanor Dondero · Comisión 1

---

## 1. Descripción general del sistema

**AulaSys** es un sistema de gestión de aulas para una institución educativa. Está compuesto por una **API RESTful** desarrollada con **Spring Boot** y un **cliente web en Angular** que la consume.

El sistema resuelve la asignación y reserva de aulas, y modela tres tipos de usuarios (**ADMIN**, **PROFESOR** y **ALUMNO**). Permite:

- Administrar aulas (capacidad, tipo y equipamiento).
- Definir materias e indicar si requieren laboratorio.
- Dar de alta usuarios y asignar materias a los profesores.
- Crear comisiones (materia + profesor + turno + cantidad de alumnos + período) y asignarles una **clase fija** semanal.
- Realizar **reservas esporádicas** de aulas para una comisión, liberando temporalmente el aula de la clase fija en esa fecha cuando corresponde.
- Consultar las **clases de una fecha**, mostrando el aula efectiva (fija o reservada) de cada comisión.
- Consultar y depurar el **historial** de reservas.
- Reportar y gestionar **avisos** sobre el estado de un aula (mantenimiento, problemas, etc.).
- Editar el perfil propio.
- Autenticación HTTP Basic con autorización por rol, validada tanto en la API como en la interfaz.

**Reglas de negocio principales:**

- Turnos: **Mañana 06:00–13:00**, **Tarde 13:00–19:00** y **Noche 19:00–23:59**. Reservas y clases fijas comparten estas franjas.
- No se realizan reservas los domingos ni en fechas pasadas.
- No se permiten superposiciones horarias en una misma aula, y las materias que requieren laboratorio solo pueden usar aulas de tipo laboratorio.
- Si un profesor reserva otra aula en una fecha en la que su comisión tiene clase fija, el sistema pide confirmación y libera el aula fija **solo para esa fecha**. Al cancelar o mover la reserva, se verifica que la clase fija pueda restaurarse.
- Un profesor no puede cambiar de rol mientras tenga comisiones vigentes.
- Un profesor solo puede reportar avisos sobre aulas en las que dictó clase.

---

## 2. Integrantes del grupo

- **Joaquín Iriarte**
- **Mateo Asaro**
- **Roque Visciarelli**
- **Homero Capozzo**



---

## 3. Tecnologías utilizadas

**Backend**

- **Java 21**
- **Spring Boot 4.0.6**
  - `spring-boot-starter-data-jpa`
  - `spring-boot-starter-security`
  - `spring-boot-starter-webmvc`
  - `spring-boot-starter-validation`
- **MySQL 8** (vía `mysql-connector-j`)
- **Lombok**

**Frontend**

- **Angular 22** (componentes standalone, Signal Forms)
- **TypeScript**
- **HTML y CSS**
- **Node.js 24** y **npm**

---

## 4. Instrucciones para ejecutar el proyecto localmente

### 4.1. Requisitos previos

- **JDK 21** instalado.
- **MySQL Server 8** corriendo localmente (puerto por defecto `3306`).
- **Maven** (o usar el wrapper `mvnw` / `mvnw.cmd` incluido en el proyecto).
- **Node.js 24** y **npm** para el frontend.

### 4.2. Configuración de la base de datos

1. Crear la base `gestion_aulas` en MySQL.
2. Para una base nueva, hay dos opciones:
   - Ejecutar el script `gestion_aulas.sql` (en la raíz del repositorio), que crea las tablas: `usuario`, `aula`, `materia`, `profesor`, `profesor_materias`, `comision`, `clase_fija`, `clase_fija_liberada`, `reserva` y `aviso`.
   - O dejar que Hibernate cree/actualice las tablas automáticamente con `spring.jpa.hibernate.ddl-auto=update`.

### 4.3. Configuración de la aplicación

El archivo `Aulas/src/main/resources/application.properties` debe contener:

```properties
spring.application.name=Aulas
spring.datasource.url=jdbc:mysql://localhost:3306/gestion_aulas
spring.datasource.username=root
spring.datasource.password=TU_PASSWORD_LOCAL
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true
```

> Reemplazar `TU_PASSWORD_LOCAL` por la contraseña de tu instancia local de MySQL. **No subir contraseñas reales al repositorio.**
>
> Alternativamente, la conexión puede configurarse con las variables de entorno `SPRING_DATASOURCE_URL`, `SPRING_DATASOURCE_USERNAME` y `SPRING_DATASOURCE_PASSWORD`.

El frontend no requiere configuración adicional: el archivo `AulasysFront/proxy.conf.json` reenvía todas las peticiones `/api/**` al backend en `http://localhost:8080`.

### 4.4. Levantar el proyecto

Primero se levanta el backend y luego el frontend.

**Backend (Spring Boot)**

Desde un IDE (IntelliJ, VS Code, etc.): abrir la carpeta `Aulas` y ejecutar `AulasApplication` con el botón **Run** (▶️).

O desde la terminal, dentro de la carpeta `Aulas`:

```powershell
# Windows
.\mvnw.cmd spring-boot:run
```

```bash
# Linux / macOS
./mvnw spring-boot:run
```

La API queda disponible en `http://localhost:8080`.

**Frontend (Angular)**

Con el backend ya en ejecución, desde la carpeta `AulasysFront`:

```bash
npm ci
npm start
```

La aplicación se abre en `http://localhost:4200`.



## 5. Estructura general del proyecto

```
TPFinalAulas/
├── Aulas/              → Backend (API REST en Spring Boot)
├── AulasysFront/       → Frontend (cliente Angular)
├── gestion_aulas.sql   → Script de creación de la base de datos
└── README.md
```

### 5.1. Backend — `Aulas/`

```
Aulas/
├── src/main/java/com/TrabajoFinal/Aulas/
│   ├── config/          → SecurityConfig (seguridad y roles) y TimeConfig
│   ├── Controller/      → Controladores REST (capa de entrada HTTP)
│   ├── Dtos/            → DTOs de request/response organizados por entidad
│   │   ├── aulaDTO/  avisoDTO/  comisionDTO/  materiaDTO/
│   │   └── profesorDTO/  reservaDTO/  usuarioDTO/
│   ├── exceptions/      → GlobalExceptionHandler y excepciones propias
│   ├── model/           → Entidades JPA
│   │   └── enums/       → Rol, Horario, DiaSemana, Tipo, Estado, EstadoReserva
│   ├── Repository/      → Interfaces JpaRepository con queries derivadas y @Query
│   ├── service/         → Lógica de negocio y validaciones (incluye AgendaRules)
│   └── AulasApplication.java
├── src/main/resources/
│   └── application.properties
├── src/test/java/...    → Tests de servicios y de seguridad
├── pom.xml
└── mvnw / mvnw.cmd
```

**Justificación de la organización por capas:**

- **Controller**: expone los endpoints HTTP y delega toda la lógica a la capa de servicio. No contiene reglas de negocio.
- **Service**: concentra las reglas de negocio (validaciones de horario, conflictos, permisos y propiedad de los recursos) y orquesta las llamadas a los repositorios.
- **Repository**: abstrae el acceso a datos mediante Spring Data JPA, usando queries derivadas del nombre del método y `@Query` (JPQL) para consultas complejas (ej. detección de conflictos de horario).
- **DTOs**: separan el modelo de persistencia del contrato de la API, evitando exponer las entidades y sus relaciones.
- **exceptions**: centraliza el manejo de errores con `@RestControllerAdvice`, evitando bloques *try/catch* repetidos en cada controlador.

### 5.2. Frontend — `AulasysFront/`

```
AulasysFront/
├── src/
│   ├── app/
│   │   ├── auth/          → Login, AuthService y guards (auth, guest, role)
│   │   ├── aulas/         → Listado y formulario de aulas
│   │   ├── materias/      → Listado y formulario de materias
│   │   ├── usuarios/      → Usuarios (listado/formulario) y perfil propio
│   │   ├── profesores/    → Profesores y asignación de materias
│   │   ├── comisiones/    → Comisiones, detalle y asignación de clase fija
│   │   ├── reservas/      → Reservas activas, historial, detalle y formulario
│   │   ├── clases/        → Consulta de clases por fecha
│   │   ├── avisos/        → Listado y formulario de avisos
│   │   ├── errors/        → Páginas de acceso denegado y no encontrado
│   │   ├── shared/        → Shell (menú lateral), interceptor HTTP, diálogos,
│   │   │                    notificaciones y mensajes de error de campos
│   │   ├── app.routes.ts  → Rutas principales (carga diferida por módulo)
│   │   └── app.config.ts
│   ├── index.html
│   ├── main.ts
│   └── styles.css         → Estilos globales
├── proxy.conf.json        → Proxy de /api/** hacia el backend
├── angular.json
└── package.json
```

Cada módulo funcional se divide en:

- **`data-access/`**: servicios que consumen la API y modelos/tipos de datos.
- **`features/`**: componentes de pantalla; cada uno conserva su plantilla HTML y su CSS en archivos propios dentro de su carpeta.
- **`*.routes.ts`**: rutas del módulo, protegidas por guards según el rol.

---

## 6. Modelo de datos — Entidades principales

| Entidad | Descripción | Relaciones principales |
|---|---|---|
| `Usuario` | Cuenta del sistema con rol (ADMIN/PROFESOR/ALUMNO). Implementa `UserDetails` para integrarse con Spring Security. | 1:1 con `Profesor` (si el rol es PROFESOR) |
| `Profesor` | Extiende la información de un `Usuario` con rol PROFESOR. | 1:1 con `Usuario`, N:M con `Materia`, 1:N con `Comisión` |
| `Materia` | Asignatura; indica si requiere laboratorio. | N:M con `Profesor` |
| `Aula` | Espacio físico con capacidad, tipo y equipamiento. | 1:N con `Reserva`, 1:N con `ClaseFija`, 1:N con `Aviso` |
| `Comisión` | Agrupa una materia, un profesor, la cantidad de alumnos, el turno y el período de cursada. | N:1 con `Profesor` y `Materia`, 1:1 opcional con `ClaseFija` |
| `ClaseFija` | Horario semanal fijo de una comisión en un aula determinada. | 1:1 con `Comisión`, N:1 con `Aula` |
| `ClaseFijaLiberada` | Registra que, en una fecha puntual, una clase fija fue liberada por una reserva esporádica. Es única por clase y fecha. | N:1 con `ClaseFija`, vinculada a la `Reserva` que la originó |
| `Reserva` | Uso puntual de un aula por una comisión en una fecha y horario específicos. | N:1 con `Comisión` y `Aula` |
| `Aviso` | Reporte sobre el estado de un aula realizado por un usuario. | N:1 con `Aula` y `Usuario` |

> En las comisiones, el campo `id_profesor` corresponde al identificador de la entidad **Profesor** (devuelto por `GET /api/profesores`). Ese endpoint también devuelve `usuarioId` para distinguir ambas identidades.

---

## 7. Autenticación y autorización

### 7.1. Mecanismo

La API utiliza **HTTP Basic Authentication** con sesión **stateless** (`SessionCreationPolicy.STATELESS`): no se mantiene sesión en el servidor y cada request debe incluir las credenciales en el header `Authorization: Basic <base64(email:password)>`.

- Las contraseñas se almacenan con hash **BCrypt** (`BCryptPasswordEncoder`).
- Las credenciales inválidas devuelven **401** y los accesos sin permiso **403**, ambos con un mensaje en JSON.
- En el frontend, un interceptor HTTP agrega el header a cada petición. Las credenciales se conservan **solo en memoria**: recargar la pestaña requiere iniciar sesión nuevamente. Cambiar el correo o la contraseña obliga a volver a ingresar.
- Los permisos se validan en la API (rol y propiedad del recurso) y la interfaz los acompaña con guards de rutas y ocultando acciones no permitidas.

### 7.2. Roles del sistema

| Rol | Descripción |
|---|---|
| `ADMIN` | Gestión completa del sistema: usuarios, profesores, aulas, materias, comisiones, clases fijas, reservas y estado de los avisos. |
| `PROFESOR` | Gestiona sus propias reservas y avisos, consulta sus comisiones y su historial. |
| `ALUMNO` | Consulta de aulas, materias y clases por fecha; edición de su perfil. |

Se define además una **jerarquía de roles** (`RoleHierarchy`) donde `ROLE_ADMIN` hereda los permisos de `ROLE_PROFESOR` y `ROLE_ALUMNO`. Las verificaciones de propiedad (por ejemplo, que un profesor solo edite o cancele sus propias reservas) se resuelven comparando el usuario autenticado con el dueño del recurso.

**Permisos por funcionalidad:**

| Función | Administrador | Profesor | Alumno |
|---|---|---|---|
| Consultar aulas, materias y clases por fecha | Sí | Sí | Sí |
| Editar perfil propio | Sí | Sí | Sí |
| Administrar aulas, materias y usuarios | Sí | No | No |
| Asignar materias a profesores | Sí | No | No |
| Consultar comisiones | Todas | Propias | En consulta de clases |
| Administrar comisiones y clase fija | Sí | No | No |
| Consultar reservas activas | Sí | Sí | En consulta de clases |
| Crear, editar y cancelar reservas | Todas | Propias | No |
| Consultar y depurar historial | Todo | Propio | No |
| Crear y editar avisos | — | Propios | No |
| Cambiar estado de avisos | Sí | No | No |

> El perfil propio no permite modificar el rol ni las materias.

### 7.3. Mapa de endpoints por rol

| Endpoint | Método | Rol requerido |
|---|---|---|
| `/api/aulas` | GET | Cualquier autenticado |
| `/api/aulas` | POST | ADMIN |
| `/api/aulas/{id}` | PUT / DELETE | ADMIN |
| `/api/materias` | GET | ADMIN / PROFESOR / ALUMNO |
| `/api/materias` | POST | ADMIN |
| `/api/materias/{id}` | PUT / DELETE | ADMIN |
| `/api/usuarios` | GET / POST | ADMIN |
| `/api/usuarios/{id}` | GET / PUT / DELETE | ADMIN |
| `/api/usuarios/me` | GET / PUT | Cualquier autenticado (perfil propio) |
| `/api/profesores/**` | GET / PUT | ADMIN |
| `/api/comision` | GET | Cualquier autenticado |
| `/api/comision/mis-comisiones` | GET | Cualquier autenticado (devuelve las propias) |
| `/api/comision/materia/{id}` | GET | ADMIN / PROFESOR / ALUMNO |
| `/api/comision` | POST | ADMIN |
| `/api/comision/{id}` | PUT / DELETE | ADMIN |
| `/api/clase-fija/**` | POST / DELETE | ADMIN |
| `/api/clases?fecha=AAAA-MM-DD` | GET | Cualquier autenticado |
| `/api/clases/semana` | GET | Cualquier autenticado |
| `/api/reservas` | GET | ADMIN / PROFESOR |
| `/api/reservas` | POST | PROFESOR (dueño de la comisión) |
| `/api/reservas/{id}` | GET / PUT / DELETE | ADMIN / PROFESOR (dueño) |
| `/api/reservas/cancelar/{id}` | PUT | ADMIN / PROFESOR (dueño) |
| `/api/avisos` | GET | ADMIN / PROFESOR |
| `/api/avisos/aulas-habilitadas` | GET | ADMIN / PROFESOR |
| `/api/avisos` | POST | PROFESOR |
| `/api/avisos/{id}` | PUT | PROFESOR (dueño) |
| `/api/avisos/{id}` | DELETE | ADMIN |
| `/api/avisos/{id}/estado` | PUT | ADMIN |

### 7.4. Usuarios de prueba

El sistema incluye un usuario administrador precargado en `CustomUserDetailsService` para ingresar sin necesidad de cargar datos en la base:

| Usuario | Contraseña | Rol |
|---|---|---|
| `admin` | `Usuario1` | ADMIN |

> Para probar el resto de las funcionalidades (perfil, reservas, avisos), se recomienda ingresar como `admin`, crear profesores y alumnos desde **Usuarios** e iniciar sesión con su correo.

---

## 8. Repositorio, Swagger y entregables

- **Repositorio de GitHub**: [https://github.com/joaquiniriarte978-lab/TPFinalAulas](https://github.com/joaquiniriarte978-lab/TPFinalAulas)
- **Documentación interactiva (Swagger/OpenAPI)**: la dependencia `springdoc-openapi-starter-webmvc-ui` está incluida y las rutas `/swagger-ui/**` y `/v3/api-docs/**` están habilitadas sin autenticación. Con el backend en ejecución, disponible en:
  > `http://localhost:8080/swagger-ui/index.html`
- **Entregables**:
  - Backend Spring Boot (`Aulas/`).
  - Frontend Angular (`AulasysFront/`).
  - Script de base de datos (`gestion_aulas.sql`).
  - Este README con la documentación del sistema.
- **Despliegue**: el proyecto se entrega para ejecución y prueba en entorno local, según las instrucciones de la sección 4. No se realizó despliegue en una plataforma cloud pública.
