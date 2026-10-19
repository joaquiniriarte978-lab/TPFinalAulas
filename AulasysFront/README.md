# AulaSys — Angular

Cliente Angular 22 para el backend Spring Boot de `../Aulas`. Incluye los sprints 1 y 2 y mantiene el estilo simple del proyecto: menú lateral, tablas y formularios.

El detalle de las 13 historias del segundo sprint está en [SPRINT-2.md](../SPRINT-2.md).

## Ejecutar

Requisitos: Node.js 24, npm, JDK 21 y MySQL 8.

1. Iniciar MySQL con la base `gestion_aulas`. La conexión se configura en `Aulas/src/main/resources/application.properties` o con `SPRING_DATASOURCE_URL`, `SPRING_DATASOURCE_USERNAME` y `SPRING_DATASOURCE_PASSWORD`.
2. Desde `Aulas`, ejecutar `mvnw.cmd spring-boot:run`.
3. Desde `AulasysFront`, ejecutar `npm ci` y luego `npm start`.
4. Abrir http://localhost:4200. El proxy reenvía `/api/**` al backend en el puerto 8080.

Las cuentas demo existentes son `admin`, `profesor` y `alumno`, con contraseña `Usuario1`. Para probar perfil, reservas y avisos, crear una cuenta real desde Usuarios e ingresar con su correo: las cuentas demo no tienen datos académicos asociados.

## Permisos

| Función | Administrador | Profesor | Alumno |
| --- | --- | --- | --- |
| Consultar aulas, materias y clases por fecha | Sí | Sí | Sí |
| Editar perfil propio | Sí | Sí | Sí |
| Administrar aulas, materias y usuarios | Sí | No | No |
| Asignar materias a profesores | Sí | No | No |
| Consultar comisiones | Todas | Propias | En consulta de clases |
| Administrar comisiones y clase fija | Sí | No | No |
| Consultar reservas activas | Sí | Sí | En consulta de clases |
| Crear, editar y cancelar reservas | Todas | Propias | No |
| Consultar y depurar historial | Todo | Propio | No |
| Crear y editar avisos propios | — | Sí | No |

El servidor valida los permisos y la propiedad; las rutas protegidas y botones de Angular acompañan esas reglas.

## Datos y formularios

- Las credenciales HTTP Basic se conservan únicamente en memoria. Recargar la pestaña requiere ingresar nuevamente.
- Cambiar correo o contraseña obliga a iniciar sesión con los nuevos datos. Editar el nombre mantiene la sesión.
- El perfil no admite modificar rol ni materias. Un profesor no puede cambiar de rol mientras tenga comisiones vigentes.
- Las comisiones usan el identificador de Profesor; la API devuelve también `usuarioId` para distinguirlos. Editar la comisión no modifica su clase fija.
- El cambio de aula pide confirmación y afecta una única fecha. Al cancelar o mover la reserva se verifica que la clase fija pueda restaurarse.
- Turnos: mañana 06–13, tarde 13–19 y noche 19–23:59. No se reserva los domingos.
- Formularios con carga, errores, reintento, confirmaciones y protección contra envíos duplicados.

## Verificar

Desde `AulasysFront`:

```powershell
npm test -- --watch=false
npm run build
```

Desde `Aulas`:

```powershell
.\mvnw.cmd test
```

La suite Java utiliza H2 en memoria y no necesita MySQL. Se verificaron 29 pruebas Angular y 32 pruebas Java; las 14 de integración de agenda también pasaron en una instancia MySQL temporal. La compilación genera `dist/AulasysFront/browser`.

Para producción, el servidor debe resolver las rutas Angular con `index.html` y reenviar `/api/**` al backend. El proxy de desarrollo solo se usa con `npm start`.

## Recorrido del sprint 2

1. Entrar como administrador, crear un profesor y asignarle una materia en Profesores y materias.
2. Crear su comisión y asignarle una clase fija desde el detalle.
3. Entrar con ese profesor y reservar otra aula para una fecha de su clase fija. Confirmar el cambio.
4. Consultar Clases para esa fecha: aparece el aula reservada. La semana siguiente conserva el aula fija.
5. Editar o cancelar la reserva y comprobar la actualización de la consulta.
6. Crear un aviso de un aula habilitada y editarlo.
7. Entrar como alumno: puede consultar clases y su perfil; no aparecen acciones de administración o reserva.
