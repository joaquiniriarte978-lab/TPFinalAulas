# Sprint 2

Alcance: SCRUM Sprint 2 (id 4), 13 historias y sus 34 subtareas. Se conserva el estilo del proyecto y se usa Angular.

| Historia | Subtareas | Entrega |
| --- | --- | --- |
| SCRUM-18 · Perfil | 55–56 | Editar nombre, correo y contraseña. Reingreso al cambiar credenciales; rol y materias protegidos. |
| SCRUM-23 · Usuarios | 66–68 | Formularios de alta/edición, bajas protegidas y bloqueo de cambio de rol con comisiones vigentes. |
| SCRUM-24 · Profesores | 69–71 | Identidad de profesor separada de usuario, selección por materia y asignaciones sin duplicados. |
| SCRUM-25 · Comisiones | 72–74 | Lista, detalle y formulario; validación de cambios contra clases y reservas futuras. |
| SCRUM-26 · Clase fija | 75–77 | Asignar, editar y quitar desde la comisión; una clase semanal por comisión. |
| SCRUM-27 · Consulta de reservas | 78–79 | Lista, detalle, filtros y acciones según propiedad y estado. |
| SCRUM-28 · Crear reserva | 80–83 | Formulario y validación de fechas, turno, capacidad, laboratorio y ocupación. Escritura transaccional. |
| SCRUM-29 · Editar reserva | 84–85 | Mismo formulario; se excluye la propia reserva al buscar superposiciones. |
| SCRUM-30 · Cambio de aula | 86–88 | Confirmación con fecha y aulas; liberación asociada a la reserva y válida solo para esa fecha. |
| SCRUM-31 · Cancelar | 89–90 | Confirmación, actualización de lista y restauración de clase fija si está disponible. |
| SCRUM-32 · Historial | 91–92 | Finalización automática, filtros y eliminación de reservas terminadas propias o por administrador. |
| SCRUM-33 · Avisos | 93–94 | Crear y editar avisos propios en aulas habilitadas; conserva autor, fecha y estado. |
| SCRUM-36 · Consulta del alumno | 99–101 | Aula efectiva por fecha, materia y aula, con detalle de consulta. |

## Reglas acordadas

- Mañana: 06:00–13:00. Tarde: 13:00–19:00. Noche: 19:00–23:59. No se reservan domingos. Los horarios contiguos no se superponen.
- Un profesor con comisiones actuales o futuras no puede cambiar de rol ni perder las materias de esas comisiones.
- Cancelar elimina la reserva activa. Si el aula fija ya fue ocupada por otra reserva, la operación se rechaza y conserva ambos registros.
- La eliminación del historial conserva la excepción de la clase fija para no volver a mostrar un aula que no se usó.
- Las operaciones de agenda bloquean las aulas en un orden común dentro de la transacción antes de validar. Es una solución sencilla para el tamaño de este proyecto; serializa también cambios en aulas diferentes.

## Ejecutar y probar

Las instrucciones están en [AulasysFront/README.md](AulasysFront/README.md). Usar cuentas registradas para perfil, reservas y avisos; las cuentas demo no tienen profesor ni datos académicos propios.

Desde `Aulas`: `mvnw.cmd test`. Las 32 pruebas Java usan una base H2 en memoria y un reloj fijo para los casos de agenda; incluyen colisiones simultáneas, reversión completa, permisos, historial y datos académicos. Las 14 pruebas de integración de agenda también pasaron en MySQL 8.0.45 con aislamiento `REPEATABLE_READ`, en una instancia temporal.

Desde `AulasysFront`: `npm test -- --watch=false` y `npm run build`. Hay 29 pruebas Angular. También se comprobó en navegador el ingreso, la confirmación y guardado de un cambio de aula, su consulta por fecha y la creación de un aviso, con datos ficticios en una base temporal.

## Base de datos existente

Con `ddl-auto=update`, Hibernate incorpora el vínculo nullable `clase_fija_liberada.id_reserva`, su clave foránea y la unicidad por clase/fecha. El script `gestion_aulas.sql` incluye la estructura para bases nuevas.

Si hay liberaciones antiguas sin vínculo, al editar o cancelar se asocian cuando existe una única reserva de esa comisión y fecha. Si hay varias candidatas, se informa el problema sin elegir una por su cuenta. No se eliminan registros antiguos para resolverlo. Antes de actualizar una base con datos, comprobar que no haya liberaciones duplicadas por clase/fecha.

Se verificó con H2 y con MySQL temporal. La base del equipo no se modificó y los cambios de código quedaron locales.
