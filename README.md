[README.md](https://github.com/user-attachments/files/29182488/README.md)
# Gestión de Aulas — API RESTful

Trabajo Práctico Final — **Programación III**
Tecnicatura Universitaria en Programación · Universidad Tecnológica Nacional (UTN)
Profesor: Rodrigo Soto · Comisión 3
---

## 1. Descripción general del sistema

**Gestión de Aulas** es una API RESTful desarrollada con **Spring Boot** que resuelve la problemática de asignación y reserva de aulas dentro de una institución educativa. El sistema modela tres tipos de usuarios (ADMIN, PROFESOR, ALUMNO) y permite:

- Administrar aulas (capacidad, tipo, equipamiento).
- Definir materias y si requieren laboratorio.
- Crear comisiones (materia + profesor + horario + cantidad de alumnos) con una **clase fija** semanal opcional.
- Realizar **reservas esporádicas** de aulas para una comisión, incluso liberando temporalmente el horario de una clase fija si hay conflicto.
- Reportar y gestionar **avisos** sobre el estado de un aula (mantenimiento, problemas, etc.).
- Autenticación HTTP Basic con autorización por rol sobre cada endpoint.

El proyecto incluye, además del backend, un frontend en HTML/CSS/JS vanilla que consume la API y sirve como cliente de prueba funcional.

---

## 2. Integrantes del grupo


- **Joaquín Iriarte**
- **Mateo Asaro**
- **Roque Visciarelli** 
- **Homero Capozzo** 

> El trabajo se organizó mediante ramas individuales por funcionalidad, *push* a esas ramas y *pull requests* hacia `main` revisadas antes de mergear.

---

## 3. Tecnologías utilizadas

- **Java 21**
- **Spring Boot 4.0.6**
  - `spring-boot-starter-data-jpa`
  - `spring-boot-starter-security`
  - `spring-boot-starter-webmvc`
  - `spring-boot-starter-validation`
- **MySQL** (vía `mysql-connector-j`)
- **Lombok**
- **springdoc-openapi-starter-webmvc-ui** (Swagger/OpenAPI)
- **Frontend**: HTML5, CSS3 y JavaScript vanilla (sin frameworks ni build tools)

---

## 4. Instrucciones para ejecutar el proyecto localmente

### 4.1. Requisitos previos

- JDK 21 instalado.
- MySQL Server corriendo localmente (puerto por defecto `3306`).
- Maven (o usar el wrapper `./mvnw` incluido en el proyecto).

### 4.2. Configuración de la base de datos

1. Ejecutar el script SQL provisto en `database/schema.sql` (ver sección 5) contra el servidor MySQL para crear la base `gestion_aulas` y sus tablas principales.
2. **Nota importante**: la tabla `clase_fija_liberada` **no está incluida en el script SQL manual**, porque el proyecto usa `spring.jpa.hibernate.ddl-auto=update`. Hibernate la crea automáticamente al levantar la aplicación por primera vez a partir de la entidad `ClaseFijaLiberada`. No es necesario crearla a mano, pero si en algún entorno se desactiva `ddl-auto`, hay que agregarla manualmente (ver sección 9, aclaraciones).

### 4.3. Configuración de la aplicación

El archivo `src/main/resources/application.properties` debe contener:

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

### 4.4. Levantar el proyecto

```bash
cd Aulas
./mvnw spring-boot:run
```

La aplicación queda disponible en `http://localhost:8080`.

 > _Enlace de Swagger:_
   > `http://localhost:8080/swagger-ui/index.html`
---

## 5. Estructura general del proyecto

```
Aulas/
├── src/main/java/com/TrabajoFinal/Aulas/
│   ├── config/            → Configuración de seguridad (SecurityConfig)
│   ├── Controller/        → Controladores REST (capa de entrada HTTP)
│   ├── Dtos/               → DTOs de entrada/salida, organizados por entidad
│   ├── exceptions/         → Manejo centralizado de errores
│   ├── model/               → Entidades JPA y enums
│   ├── Repository/         → Interfaces JpaRepository con queries derivadas/@Query
│   ├── service/             → Lógica de negocio y validaciones
│   └── AulasApplication.java
├── src/main/resources/
│   ├── application.properties
│   └── static/             → Frontend (HTML/CSS/JS)
└── src/test/java/...        → Tests unitarios (ReservaServiceTest)
```

**Justificación de la organización por capas:**

- **Controller**: expone los endpoints HTTP, delega toda lógica a la capa de servicio. No contiene reglas de negocio.
- **Service**: concentra las reglas de negocio (validaciones de horario, conflictos, permisos por rol) y orquesta llamadas a uno o más repositorios.
- **Repository**: abstrae el acceso a datos mediante Spring Data JPA, usando queries derivadas del nombre del método y `@Query` (JPQL) para consultas más complejas (ej. detección de conflictos de horario).
- **DTOs**: separan el modelo de persistencia del contrato de la API, evitando exponer la entidad completa en los casos donde se definieron (Usuario, Aviso, Comisión, Reserva).
- **exceptions**: centraliza el manejo de errores con `@RestControllerAdvice`, evitando bloques *try/catch* repetidos en cada controlador.

---

## 6. Modelo de datos — Entidades principales

| Entidad | Descripción | Relaciones principales |
|---|---|---|
| `Usuario` | Cuenta del sistema con rol (ADMIN/PROFESOR/ALUMNO). Implementa `UserDetails` para integrarse con Spring Security. | 1:1 con `Profesor` (si el rol es PROFESOR) |
| `Profesor` | Extiende la información de un `Usuario` con rol PROFESOR. | 1:1 con `Usuario`, N:M con `Materia`, 1:N con `Comisión` |
| `Materia` | Asignatura, indica si requiere laboratorio. | N:M con `Profesor` |
| `Aula` | Espacio físico con capacidad, tipo y equipamiento. | 1:N con `Reserva`, 1:N con `ClaseFija`, 1:N con `Aviso` |
| `Comisión` | Agrupa una materia, un profesor, cantidad de alumnos y turno. | N:1 con `Profesor` y `Materia`, 1:1 opcional con `ClaseFija` |
| `ClaseFija` | Horario semanal fijo de una comisión en un aula determinada. | 1:1 con `Comisión`, N:1 con `Aula` |
| `ClaseFijaLiberada` | Registra que, para una fecha puntual, una clase fija fue liberada para permitir una reserva esporádica en su lugar. | N:1 con `ClaseFija` |
| `Reserva` | Uso puntual de un aula por una comisión en una fecha específica. | N:1 con `Comisión` y `Aula` |
| `Aviso` | Reporte sobre el estado de un aula, hecho por un usuario. | N:1 con `Aula` y `Usuario` |

### Esquema de base de datos

El script DDL completo se encuentra en `database/schema.sql`. Resumen de tablas: `usuario`, `aula`, `materia`, `profesor`, `profesor_materias`, `comision`, `clase_fija`, `reserva`, `aviso`. La tabla `clase_fija_liberada` se autogenera vía Hibernate (ver sección 4.2).

---

## 7. Autenticación y autorización

### 7.1. Mecanismo

La API utiliza **HTTP Basic Authentication** sobre una sesión **stateless** (`SessionCreationPolicy.STATELESS`), es decir, no se mantiene sesión en el servidor: cada request debe incluir las credenciales codificadas en el header `Authorization: Basic <base64(email:password)>`.

Las contraseñas se almacenan con hash **BCrypt** (`BCryptPasswordEncoder`).

### 7.2. Roles del sistema

| Rol | Descripción |
|---|---|
| `ADMIN` | Gestión completa del sistema: usuarios, aulas, materias, comisiones. |
| `PROFESOR` | Gestiona sus propias comisiones, reservas y avisos. |
| `ALUMNO` | Acceso de solo lectura a aulas, materias, comisiones y clases. |

Se definió además una **jerarquía de roles** (`RoleHierarchy`) donde `ROLE_ADMIN` hereda los permisos de `ROLE_PROFESOR` y `ROLE_ALUMNO`. Esta jerarquía aplica a las verificaciones declarativas (`hasRole`/`hasAnyRole`) de `SecurityConfig`; las verificaciones manuales dentro de los controladores (por ejemplo, distinguir si quien hace una reserva es el profesor dueño de la comisión) se resuelven comparando el email autenticado contra el dueño del recurso, no a través de la jerarquía.

### 7.3. Mapa de endpoints por rol

| Endpoint | Método | Rol requerido |
|---|---|---|
| `/api/aulas` | GET | Cualquier autenticado |
| `/api/aulas` | POST | ADMIN |
| `/api/aulas/{id}` | PUT / DELETE | ADMIN |
| `/api/materias` | GET | ADMIN / PROFESOR / ALUMNO |
| `/api/materias` | POST | ADMIN |
| `/api/materias/{id}` | PUT / DELETE | ADMIN |
| `/api/usuarios` | GET / POST / PUT / DELETE | ADMIN |
| `/api/usuarios/me` | GET / PUT | Cualquier autenticado (sobre su propio perfil) |
| `/api/comision` | GET | ADMIN / PROFESOR / ALUMNO |
| `/api/comision` | POST / PUT / DELETE | ADMIN |
| `/api/reservas` | GET | ADMIN / PROFESOR |
| `/api/reservas` | POST | PROFESOR |
| `/api/reservas/{id}` | PUT / DELETE | ADMIN / PROFESOR |
| `/api/avisos` | GET | ADMIN / PROFESOR |
| `/api/avisos` | POST | PROFESOR |
| `/api/avisos/{id}` | PUT | PROFESOR |
| `/api/avisos/{id}/estado` | PUT | ADMIN |

> Nota: algunos endpoints secundarios (ej. `GET /api/comision/{id}`, `PUT /api/reservas/cancelar/{id}`, `POST /api/clase-fija`) quedan cubiertos por la regla genérica `anyRequest().authenticated()` en lugar de tener una entrada explícita en `SecurityConfig`. Esto se documenta como aclaración para la corrección en la sección 9.

### 7.4. Usuarios de prueba

El sistema incluye tres usuarios hardcodeados en `CustomUserDetailsService`, pensados para pruebas rápidas sin necesidad de cargar datos en la base:

| Usuario | Contraseña | Rol |
|---|---|---|
| `admin` | `Usuario1` | ADMIN |
| `profesor` | `Usuario1` | PROFESOR |
| `alumno` | `Usuario1` | ALUMNO |

> Para pruebas más realistas (con datos relacionados de materias, comisiones y aulas), se recomienda dar de alta usuarios reales vía `POST /api/usuarios` autenticado como `admin`.

---

## 8. Listado de endpoints y ejemplos

### 8.1. Aulas

**`GET /api/aulas`** — Lista todas las aulas.

```json
[
  {
    "id": 1,
    "nombre": "Aula 101",
    "capacidad": 30,
    "tipo": "AULA",
    "equipamiento": "Proyector, PC"
  }
]
```

**`POST /api/aulas`** — Crea un aula (ADMIN).

```json
// Request
{
  "nombre": "Laboratorio 2",
  "capacidad": 25,
  "tipo": "LABORATORIO",
  "equipamiento": "20 PCs, proyector"
}
```

### 8.2. Comisiones

**`POST /api/comision`** — Crea una comisión, opcionalmente con clase fija (ADMIN).

```json
// Request
{
  "id_profesor": 3,
  "id_materia": 2,
  "cantAlumnos": 25,
  "horario": "MAÑANA",
  "fechaInicio": "2026-08-01",
  "fechaFin": "2026-11-01",
  "claseFija": {
    "id_aula": 1,
    "diaSemana": "LUNES",
    "horaInicio": "08:00",
    "horaFin": "10:00"
  }
}
```

> **Importante:** el campo `id_profesor` espera el **id del usuario** (no el id de la entidad `Profesor`). Ver aclaración en sección 9.

### 8.3. Reservas

**`POST /api/reservas`** — Crea una reserva esporádica (PROFESOR, dueño de la comisión).

```json
// Request
{
  "id_comision": 4,
  "id_aula": 2,
  "fecha": "2026-07-15",
  "horaInicio": "09:00",
  "horaFin": "11:00",
  "liberarClaseFija": false
}
```

Si la comisión ya tiene una clase fija ese mismo día y aún no fue liberada, la API responde **400 Bad Request** con un mensaje que comienza con `CONFIRMACION_LIBERAR_AULA:`. El frontend interpreta ese prefijo como una señal para mostrar un modal de confirmación; si el usuario confirma, se reenvía la misma request con `"liberarClaseFija": true`.

**`PUT /api/reservas/cancelar/{id_reserva}`** — Cancela una reserva activa (ADMIN / PROFESOR dueño).

### 8.4. Avisos

**`POST /api/avisos`** — Reporta un aviso sobre un aula (PROFESOR). Solo se permite si el profesor dictó una clase (reserva o clase fija) en esa aula.

```json
// Request
{
  "id_aula": 1,
  "mensaje": "El proyector no enciende"
}
```

**`PUT /api/avisos/{id}/estado`** — Cambia el estado de un aviso (ADMIN).

```json
// Request
{ "estado": "EN_REVISION" }
```

### 8.5. Usuarios

**`GET /api/usuarios/me`** — Devuelve el perfil del usuario autenticado.

**`POST /api/usuarios`** — Crea un usuario (ADMIN). Si el rol es `PROFESOR`, debe incluir `materiasIds`.

```json
// Request
{
  "nombre": "Ana Pérez",
  "email": "ana.perez@uni.edu",
  "password": "Clave1234",
  "rol": "PROFESOR",
  "materiasIds": [1, 2]
}
```

### 8.6. Respuestas de error

Las validaciones fallidas (`@Valid`) devuelven **400 Bad Request** con el primer mensaje de error de campo:

```json
"El nombre no puede estar vacío"
```

Las reglas de negocio violadas (ej. conflicto de horario) devuelven **400 Bad Request** con un mensaje descriptivo:

```json
"El aula ya tiene una reserva activa en ese horario."
```

Los recursos no encontrados devuelven **404 Not Found**:

```json
"Aula con id 99 no encontrado"
```

---

## 9. Aclaraciones importantes para la corrección


1. **Tabla `clase_fija_liberada` no está en el DDL manual**: se genera automáticamente por Hibernate (`ddl-auto=update`). Si se ejecuta el proyecto contra una base creada *solo* con el script SQL manual y sin permitir que Hibernate actualice el esquema, esta tabla faltará y las reservas que requieran liberar una clase fija fallarán.

2. **Nomenclatura de DTOs**: `ReservaResponseDTO` y `ComisionResponseDTO` se utilizan como cuerpo de las requests de creación/modificación (`@RequestBody`), a pesar de su nombre. Fue una decisión que quedó así desde una etapa temprana del desarrollo y no se renombró para no romper la integración ya probada con el frontend.

3. **Algunos endpoints secundarios no tienen una entrada explícita en `SecurityConfig`** y quedan cubiertos por la regla general `anyRequest().authenticated()` (cualquier usuario autenticado, sin distinción de rol). Esto incluye, entre otros, `DELETE /api/avisos/{id}`, `POST /api/clase-fija` y `PUT /api/reservas/cancelar/{id}`. En la práctica el frontend oculta estas acciones a los roles que no deberían usarlas, pero a nivel de API la restricción no está reforzada del lado del servidor para esos casos puntuales.

4. **Despliegue**: este proyecto se entrega para ejecución y prueba en entorno local, según las instrucciones de la sección 4. No se realizó despliegue en una plataforma cloud pública.

5. **Documentación interactiva (Swagger/OpenAPI)**: la dependencia `springdoc-openapi-starter-webmvc-ui` está incluida y los endpoints `/swagger-ui/**` y `/v3/api-docs/**` están habilitados sin autenticación en `SecurityConfig`. Disponible en `http://localhost:8080/swagger-ui/index.html` una vez levantado el proyecto.

   > _Enlace de Swagger:_
   > `http://localhost:8080/swagger-ui/index.html`

---


