<!-- converted from Auditoria_Aulasys_Metodologia_II.docx -->

Universidad Tecnológica Nacional
Tecnicatura Universitaria en Programación
Auditoría de diseño de software: Aulasys
Sistema de gestión y reserva de aulas
Trabajo práctico final
Asignatura: Metodología de Sistemas II
Docente: Lucrecia Bazan
Comisión: 1
Fecha del informe: 9 de noviembre de 2026
Exposición: 10 de noviembre de 2026
Integrantes
Roque Visciarelli
Joaquín Iriarte
Homero Capozzo
Mateo Asaro
# 1. Descripción del dominio
Aulasys organiza el uso de aulas de una institución educativa. Vincula materias, profesores y comisiones con espacios físicos, horarios semanales y reservas para fechas puntuales. Su propósito es evitar asignaciones incompatibles y permitir que los alumnos consulten dónde se dicta cada clase.
Una comisión puede tener una clase fija semanal. Cuando necesita cambiar de aula para una fecha, la reserva debe contemplar esa clase y registrar su liberación puntual. La clase fija conserva su vigencia para las demás fechas. Esta relación es el centro de las reglas de agenda.
| Actor | Necesidades principales |
| --- | --- |
| Administrador | Administrar usuarios, aulas, materias, profesores, comisiones y clases fijas. Supervisar reservas y gestionar el estado de los avisos. |
| Profesor | Consultar sus comisiones, crear o modificar reservas propias y reportar problemas en aulas habilitadas. |
| Alumno | Consultar clases y conocer el aula efectiva para una fecha. |

## Requerimientos que condicionan el diseño
Las reservas deben respetar la vigencia de la cursada, la capacidad del aula y la necesidad de laboratorio. El horario de fin debe ser posterior al inicio y quedar dentro del turno: mañana de 06:00 a 13:00, tarde de 13:00 a 19:00 y noche de 19:00 a 23:59. No se admiten clases los domingos ni reservas que comiencen en el pasado.
También deben impedirse solapamientos del aula o de la comisión. Dos solicitudes simultáneas no pueden confirmar la misma disponibilidad. Los permisos deben comprobarse en la API, incluso cuando Angular ya oculta las acciones que no corresponden al rol.
# 2. Composición del equipo
- Roque Visciarelli
- Joaquín Iriarte
- Homero Capozzo
- Mateo Asaro
Los cuatro integrantes participaron en la autoría del proyecto y participaron de forma activa en todas las partes de este trabajo: análisis del sistema, propuestas de mejora, diagramas UML, diseño de pruebas, redacción del informe y preparación de la defensa.
# 3. Arquitectura del proyecto
El sistema utiliza una arquitectura web cliente-servidor. Angular presenta las pantallas y consume una API REST en Spring Boot. El backend concentra las reglas del dominio y persiste los datos en MySQL. Se trata de un monolito organizado en capas, adecuado para el tamaño y el alcance académico del proyecto.

| Componente | Implementación actual |
| --- | --- |
| Interfaz | Angular 22 y TypeScript. El código está organizado por módulos (aulas, auth, avisos, clases, comisiones, materias, profesores, reservas y usuarios), además de una carpeta shared con elementos comunes. Cada módulo separa el acceso a datos (data-access) de las pantallas (features). |
| API y dominio | Java 21 y Spring Boot 4.0.6. Paquetes Controller, service, Dtos, model, exceptions y config. La API se documenta con Swagger (OpenAPI). |
| Persistencia | Repositorios que extienden JpaRepository, entidades JPA y MySQL. Maven administra las dependencias del backend. |
| Seguridad | Spring Security, HTTP Basic y permisos por rol. Se usa BCrypt para contraseñas y la API no guarda sesiones. |
| Repositorio | GitHub: joaquiniriarte978-lab/TPFinalAulas. La base de esta revisión es el commit 1114d6d de la rama main (3 de noviembre de 2026). |

# 4. Estado actual del código
La separación entre controladores, servicios y repositorios ya está presente. Los DTO evitan exponer parte de las entidades directamente, y el manejador central de excepciones unifica respuestas. AgendaRules reúne reglas compartidas y recibe un Clock, lo que facilita controlar las fechas en pruebas.
Desde la primera revisión, el cambio principal fue la reorganización del frontend por módulos, que dejó cada funcionalidad con sus pantallas y su acceso a datos en un mismo lugar. Esa reorganización no modificó la lógica del backend, por lo que los problemas detectados siguen presentes y las cinco propuestas continúan vigentes. El backend cuenta con pruebas automatizadas; en el frontend, los archivos de prueba se eliminaron durante esa reorganización y quedan pendientes de reponer.
La revisión también muestra responsabilidades mezcladas en algunos puntos. ReservaService arma respuestas y finaliza reservas además de gestionar la agenda. ClasesController consulta repositorios y compone el resultado. En avisos no existe una política explícita de transiciones, y Angular reconoce una confirmación mediante el texto de una excepción.
No se observó una jerarquía de herencia profunda que justifique reemplazarla. Profesor se relaciona con Usuario mediante una asociación, no mediante una subclase. Las propuestas se concentran en problemas concretos, sin agregar interfaces o patrones donde no aporten una separación útil.
## Propuestas de mejora
Para que las propuestas se entiendan sin conocer el código, usamos estos términos:
- Pantalla o frontend: lo que ve y usa la persona (Angular).
- Backend: la parte que aplica las reglas y guarda los datos (Spring Boot).
- Clase: un bloque de código encargado de una tarea.
- Controlador: la clase que recibe los pedidos de la pantalla y devuelve la respuesta.
- Servicio: la clase que aplica las reglas del sistema.
- Interfaz: un acuerdo que indica qué se le puede pedir a una parte del sistema, sin decir cómo lo resuelve.

## P1. Repartir el trabajo que hoy hace una sola clase de reservas
Módulo / paquete: paquete service, archivo ReservaService.java (guardar, finalizarReservasVencidas y dto). Es la clase que se ocupa de las reservas.
Descripción del dominio: una reserva puede reemplazar por un día la clase semanal de una comisión. Hoy una sola clase guarda la reserva, libera la clase fija, marca como finalizadas las reservas vencidas y prepara los datos que se ven en pantalla. Son tareas distintas que cambian por motivos distintos.
Solución a implementar: dividir ese trabajo en tres clases, cada una con una sola tarea:
- ReservaService sigue creando, modificando y cancelando reservas.
- ReservaMapper (nueva) prepara los datos que se muestran en pantalla.
- FinalizacionReservasService (nueva) revisa cada minuto qué reservas terminaron y las marca como finalizadas.
Guardar la reserva y liberar la clase fija siguen siendo una sola operación: se hacen las dos o no se hace ninguna. Se aplica el principio de Responsabilidad Única de SOLID (cada clase tiene un solo motivo para cambiar) y Alta Cohesión y Fabricación Pura de GRASP (las tareas relacionadas quedan juntas, en clases de apoyo creadas para eso).
Ventajas de la implementación: cada tarea queda en un lugar fácil de encontrar. Cambiar lo que se muestra en pantalla no pone en riesgo el guardado de reservas, y cada parte se puede probar por separado.
Posibles desventajas:
- ¿Es viable? sí. Es un reordenamiento interno que no cambia lo que ve el usuario. Se estiman de 6 a 8 horas, con pruebas incluidas.
- ¿Afecta a otras partes? de forma moderada. Hay que ajustar ReservaController y agregar dos clases. Al mover el código hay que cuidar que la reserva y la liberación se sigan guardando juntas.
- ¿Tolera cambios futuros? sí. Una nueva forma de mostrar las reservas o un cambio en la finalización automática afectaría solo a la clase correspondiente.

## P2. Llevar la consulta de clases a su propio servicio
Módulo / paquete: paquete Controller, archivo ClasesController.java (método listar). Es la clase que atiende la consulta de clases del alumno.
Descripción del dominio: para saber en qué aula se cursa un día hay que combinar la clase semanal con las reservas y liberaciones de esa fecha. Esa información puede servir para la lista del alumno, un calendario o una futura exportación.
Solución a implementar: hoy el controlador busca los datos, decide qué clases mostrar, las filtra y las ordena, cuando solo debería recibir el pedido y devolver la respuesta. Proponemos crear AgendaConsultaService, que se encargue de ese trabajo, y mover el formato de la respuesta al paquete Dtos. Una interfaz pequeña, AgendaConsulta, con la operación consultar(fecha, filtros), permitiría reutilizar la consulta desde otras partes.
Se aplican Controlador, Bajo Acoplamiento y Fabricación Pura de GRASP (cada parte depende lo menos posible de las demás) e Inversión de Dependencias de SOLID (quien usa la consulta depende del acuerdo y no de cómo está resuelta). No hace falta crear interfaces para todos los servicios.
Ventajas de la implementación: la consulta se escribe una sola vez y se puede reutilizar en otras pantallas. Además, se puede probar sin levantar la parte web del sistema.
Posibles desventajas:
- ¿Es viable? sí. Se estiman de 4 a 6 horas, y el usuario no nota ningún cambio.
- ¿Afecta a otras partes? poco. El cambio se limita a este controlador y al nuevo servicio. La respuesta debe seguir teniendo los mismos campos para no afectar a la pantalla.
- ¿Tolera cambios futuros? sí, para sumar nuevas formas de consultar. Este cambio, por sí solo, no hace más rápida la búsqueda, que sigue leyendo todas las clases fijas; mejorar eso requeriría otro cambio y más pruebas.

## P3. Separar las reglas para reservar un aula
Módulo / paquete: paquete service, archivo AgendaRules.java (métodos validar, ocupacion y validarSemanal). Es la clase que decide si una reserva cumple las reglas.
Descripción del dominio: las reglas académicas cambian de forma independiente. Sumar otro tipo de laboratorio o una nueva restricción horaria no debería obligar a tocar las demás reglas.
Solución a implementar: hoy las reglas de turno, capacidad y tipo de aula están todas juntas en un mismo método. Proponemos convertir cada regla en una pieza independiente, por ejemplo ReglaTurno, ReglaCapacidad y ReglaLaboratorio. Todas siguen la misma interfaz, ReglaAgenda, y un validador las ejecuta en orden. Para agregar una regla, se crea una pieza nueva sin modificar las existentes. La comprobación de si el aula está ocupada queda aparte.
Se aplica el patrón Strategy (cada regla es una pieza intercambiable), los principios Abierto/Cerrado e Inversión de Dependencias de SOLID (se agrega comportamiento sin modificar lo que ya funciona) y Polimorfismo y Alta Cohesión de GRASP.
Ventajas de la implementación: cada regla se entiende y se prueba por separado, y agregar una regla nueva es más simple y menos riesgoso.
Posibles desventajas:
- ¿Es viable? sí, pero es la propuesta más costosa: se estiman de 6 a 10 horas.
- ¿Afecta a otras partes? sí, de forma controlada. También usan estas reglas las reservas, las clases fijas y las comisiones, y todas deben seguir funcionando igual. El orden importa, y la protección contra dos reservas simultáneas debe quedar exactamente como está.
- ¿Tolera cambios futuros? sí, es su principal beneficio. Como contrapartida, crear demasiadas piezas para reglas muy simples agregaría trabajo innecesario.

## P4. Hacer que los errores tengan un código claro
Módulo / paquete: paquete exceptions, archivo GlobalExceptionHandler.java; ReservaService.guardar en el backend; y reservas/features/reserva-list/reserva-list.ts en el frontend.
Descripción del dominio: cuando un profesor cambia de aula un día en el que tiene clase fija, el sistema debe preguntarle si confirma. Eso es distinto de no tener permiso, de buscar algo que no existe o de encontrar el aula ocupada.
Solución a implementar: hoy el backend responde con un texto, y la pantalla detecta la confirmación mirando si el mensaje empieza con CONFIRMACION_LIBERAR_AULA. Si alguien cambia esa frase, la función deja de andar. Además, una falla inesperada del sistema se informa como si fuera un error del usuario (código 400).
Proponemos que todas las respuestas de error tengan el mismo formato, con un código, un mensaje y detalles, y crear errores específicos para cada situación. La pantalla miraría el código para decidir qué hacer y mostraría el mensaje. Se mantiene 403 para falta de permisos y 404 cuando algo no existe, y se reserva 500 para fallas inesperadas, que se registran internamente sin mostrar detalles técnicos.
Se aplican Variaciones Protegidas y Bajo Acoplamiento de GRASP: la pantalla deja de depender de cómo está redactado un mensaje. Este problema no necesita un patrón adicional.
Ventajas de la implementación: se pueden mejorar los textos sin romper funciones, cada tipo de error se distingue con claridad y es más fácil comprobar que el sistema responde bien.
Posibles desventajas:
- ¿Es viable? sí. Se estiman de 4 a 6 horas, con pruebas de validación, permisos y confirmación.
- ¿Afecta a otras partes? sí, porque cambia la forma en que se comunican el frontend y el backend. Deben adaptarse juntos o aceptar los dos formatos durante un tiempo.
- ¿Tolera cambios futuros? sí. Un error nuevo solo requiere sumar un código, sin cambiar el formato de la respuesta.

## P5. Definir qué cambios de estado puede tener un aviso
Módulo / paquete: paquete service, archivo AvisoService.java (método cambiarEstado), y model/enums/Estado.java, donde está la lista de estados posibles.
Descripción del dominio: un aviso es el reporte de un problema en un aula. Nace pendiente, pasa por una revisión y se resuelve. Solo se pueden eliminar los avisos resueltos, una restricción que ya existe. La posibilidad de reabrir un aviso queda como decisión futura.
Solución a implementar: hoy se puede pasar de cualquier estado a cualquier otro, por ejemplo de Resuelto a Pendiente, o de Pendiente a Resuelto sin revisión. Proponemos definir en un solo lugar, la lista de estados (Estado), qué cambios están permitidos, mediante una operación puedePasarA(destino). AvisoService la consultaría antes de guardar y rechazaría los cambios no permitidos.
Se aplica Experto de GRASP: la decisión queda en quien conoce los estados. Con tres estados, esta solución alcanza. Si en el futuro cada estado tuviera acciones propias, se podría evolucionar al patrón State, donde cada estado define su propio comportamiento; hoy sería más estructura de la necesaria.
Ventajas de la implementación: el seguimiento de los avisos es ordenado y predecible, y la regla queda escrita en un único lugar, fácil de consultar y de probar.
Posibles desventajas:
- ¿Es viable? sí. Se estiman de 4 a 6 horas. Una implementación completa de State costaría más.
- ¿Afecta a otras partes? poco, pero el equipo debe acordar la regla antes de aplicarla, porque hoy el sistema admite otros saltos. Pueden hacer falta ajustes en la pantalla del administrador y en las pruebas.
- ¿Tolera cambios futuros? sí. Agregar un estado o permitir reabrir un aviso se resuelve modificando un único lugar.

## Orden y esfuerzo de implementación
| Orden | Propuesta | Esfuerzo estimado |
| --- | --- | --- |
| 1 | P4. Errores con un código claro | 4 a 6 h |
| 2 | P5. Cambios de estado de los avisos | 4 a 6 h |
| 3 | P2. Consulta de clases en su propio servicio | 4 a 6 h |
| 4 | P1. Reparto del trabajo de reservas | 6 a 8 h |
| 5 | P3. Reglas para reservar separadas | 6 a 10 h |
| Cierre | Prueba general del sistema y documentación | 6 a 8 h |
| Total | Trabajo acumulado del equipo | 30 a 44 h |

Criterio de aceptación: al aplicar las mejoras, el sistema debe seguir respetando los permisos, guardar cada operación completa o no guardar nada y mostrar la misma agenda. Las pantallas deben recibir las mismas respuestas, salvo en P4 y P5, donde los cambios se documentan. No se propone cambiar de framework ni dividir el sistema en microservicios.
# 5. Diagramas UML
## 5.1 Casos de uso
Funciones principales y actores habituales, con sesión iniciada. Se omiten asociaciones secundarias, como la intervención del administrador en reservas.

## 5.2 Secuencia de una reserva válida
Escenario actual: profesor autorizado, comisión vigente, aula libre y sin clase fija a liberar. Se agrupan participantes para resumir la colaboración.

## 5.3 Estados de un aviso
Política propuesta en P5: el administrador revisa y resuelve el aviso. El nodo final indica su eliminación; no es otro valor del enum.

## 5.4 Actividad de solicitud de reserva
Si se reemplaza una clase fija, se pide confirmación. La API actual lo informa al validar; si el profesor confirma, Angular reenvía la solicitud y el servidor vuelve a validarla.

## 5.5 Diseño de condiciones de prueba con técnicas de caja negra
Las pruebas de caja negra evalúan el sistema sin conocer su estructura interna: quien prueba no accede al código ni a la lógica interna. Se observa qué entra, qué sale y cómo reacciona el sistema ante distintas condiciones, usando valores válidos, no válidos y límites. Por eso no hace falta saber programar para ejecutarlas.
En Aulasys, las entradas son los datos que completa el usuario y su rol; las funciones son crear reservas y reportar avisos; las salidas son la reserva guardada, el pedido de confirmación, el mensaje de error y lo que luego muestran las consultas.
Se aplican tres técnicas de caja negra vistas en la materia: particiones de equivalencia, análisis de valores límite y gráfico causa-efecto. Las condiciones se pueden verificar desde Angular y, cuando la pantalla no permite cargar el dato, directamente en la API.
### Datos de partida
Momento de referencia: lunes 16/11/2026 a las 08:00. Un profesor es dueño de una comisión de 30 alumnos, de turno mañana, con cursada del 01/10/2026 al 30/11/2026. Salvo que el caso indique otra cosa, se reserva el martes 17/11/2026 de 09:00 a 10:00, en un aula libre de 30 lugares y para una materia sin requisito de laboratorio. Entre un caso y otro se restauran estos datos.
### 5.5.1 Particiones de equivalencia
Se dividen los valores de entrada en clases donde probar un valor es tan representativo como probar otro. Para cada condición de entrada se buscan clases válidas e inválidas, y cada clase recibe un número único.
| Condición de entrada | Clases válidas | Clases inválidas |
| --- | --- | --- |
| Usuario que reserva | (1) Profesor dueño de la comisión o administrador | (2) Profesor de otra comisión (3) Alumno (4) Sin iniciar sesión |
| Datos obligatorios | (5) Comisión, aula, fecha, inicio y fin completos y con formato correcto | (6) Algún dato vacío (7) Algún dato con formato incorrecto |
| Comisión y aula | (8) Existen en el sistema | (9) Comisión inexistente (10) Aula inexistente |
| Fecha | (11) Futura, dentro de la cursada y de lunes a sábado | (12) Pasada (13) Fuera de la cursada (14) Domingo |
| Horario | (15) El inicio es anterior al fin y ambos están dentro del turno | (16) Fin igual al inicio (17) Fin anterior al inicio (18) Inicio antes de la apertura del turno (19) Fin después del cierre del turno |
| Capacidad del aula | (20) Igual o mayor que la cantidad de alumnos | (21) Menor que la cantidad de alumnos |
| Tipo de aula | (22) La materia no requiere laboratorio (23) La materia requiere laboratorio y el aula lo es | (24) La materia requiere laboratorio y el aula es común |
| Disponibilidad | (25) Aula y comisión libres en ese horario | (26) Aula con otra reserva (27) Comisión con otra reserva (28) Aula con clase fija de otra comisión |

Hay como mínimo un caso por cada clase. La columna "Clases" indica la clase que se prueba; en los casos inválidos, el resto de los datos pertenece a clases válidas.
| Nro. | Clases | Descripción | Datos | Resultado esperado |
| --- | --- | --- | --- | --- |
| CP01 | 1, 5, 8, 11, 15, 20, 22, 25 | Registrar reserva | Datos de partida | Se guarda la reserva y se muestra "Reserva guardada." |
| CP02 | 1, 5, 8, 11, 15, 20, 23, 25 | Registrar reserva con laboratorio | Materia con laboratorio; aula de laboratorio | Se guarda la reserva y se muestra "Reserva guardada." |
| CP03 | 2 | Detectar usuario sin permiso | Profesor de otra comisión | Error 403: "No tenés permiso para realizar esta acción." No se guarda. |
| CP04 | 3 | Detectar usuario sin permiso | Alumno | Error 403: "No tenés permiso para realizar esta acción." No se guarda. |
| CP05 | 4 | Detectar acceso sin sesión | Sin credenciales | Error 401: "Usuario o contraseña incorrectos." No se guarda. |
| CP06 | 6 | Detectar dato vacío | Fecha: (vacío) | Mensaje de error: "La fecha es obligatoria" |
| CP07 | 7 | Detectar formato incorrecto | Fecha: abc | Mensaje de error: "El formato de los datos no es válido. Revisá los campos enviados." |
| CP08 | 9 | Detectar comisión inexistente | Comisión: 9999 | Error 404: "Comisión con id 9999 no encontrado" |
| CP09 | 10 | Detectar aula inexistente | Aula: 9999 | Error 404: "Aula con id 9999 no encontrado" |
| CP10 | 12 | Detectar fecha incorrecta | Fecha: 10/11/2026 | Mensaje de error: "La reserva debe comenzar en el futuro." |
| CP11 | 13 | Detectar fecha incorrecta | Fecha: 01/12/2026 | Mensaje de error: "La fecha está fuera de la cursada." |
| CP12 | 14 | Detectar fecha incorrecta | Fecha: domingo 22/11/2026 | Mensaje de error: "No hay clases los domingos." |
| CP13 | 16 | Detectar horario incorrecto | 09:00 a 09:00 | Mensaje de error: "La hora de fin debe ser posterior al inicio." |
| CP14 | 17 | Detectar horario incorrecto | 10:00 a 09:00 | Mensaje de error: "La hora de fin debe ser posterior al inicio." |
| CP15 | 18 | Detectar horario incorrecto | 05:30 a 07:00 | Mensaje de error: "El horario debe estar dentro del turno MAÑANA (06:00–13:00)." |
| CP16 | 19 | Detectar horario incorrecto | 12:00 a 14:00 | Mensaje de error: "El horario debe estar dentro del turno MAÑANA (06:00–13:00)." |
| CP17 | 21 | Detectar aula insuficiente | Aula de 20 lugares | Mensaje de error: "El aula no tiene capacidad para la comisión." |
| CP18 | 24 | Detectar aula incompatible | Materia con laboratorio; aula común | Mensaje de error: "La materia requiere un laboratorio." |
| CP19 | 26 | Detectar conflicto | Otra comisión ya reservó esa aula de 09:00 a 10:00 | Mensaje de error: "El aula o la comisión ya tiene una reserva en ese horario." |
| CP20 | 27 | Detectar conflicto | La comisión ya reservó otra aula de 09:00 a 10:00 | Mensaje de error: "El aula o la comisión ya tiene una reserva en ese horario." |
| CP21 | 28 | Detectar conflicto | Otra comisión tiene clase fija en esa aula los martes de 09:00 a 10:00 | Mensaje de error: "El aula o la comisión tiene una clase fija en ese horario." |

### 5.5.2 Análisis de valores límite
Complementa las particiones: prueba los bordes de cada clase (el límite, justo dentro y justo fuera) para detectar errores de "fuera por uno". Cada valor es una prueba separada y el resto de los datos es válido.
| Nro. | Límite que se prueba | Justo fuera | En el límite | Justo dentro |
| --- | --- | --- | --- | --- |
| CP22 | Capacidad mínima del aula para 30 alumnos | 29: se rechaza | 30: se acepta | 31: se acepta |
| CP23 | Apertura del turno mañana (06:00), con fin 07:00 | 05:59: se rechaza | 06:00: se acepta | 06:01: se acepta |
| CP24 | Cierre del turno mañana (13:00), con inicio 12:00 | 13:01: se rechaza | 13:00: se acepta | 12:59: se acepta |
| CP25 | Apertura del turno tarde (13:00), con fin 14:00 | 12:59: se rechaza | 13:00: se acepta | 13:01: se acepta |
| CP26 | Cierre del turno tarde (19:00), con inicio 18:00 | 19:01: se rechaza | 19:00: se acepta | 18:59: se acepta |
| CP27 | Apertura del turno noche (19:00), con fin 20:00 | 18:59: se rechaza | 19:00: se acepta | 19:01: se acepta |
| CP28 | Cierre del turno noche (23:59), con inicio 23:00 | 00:00: se rechaza | 23:59: se acepta | 23:58: se acepta |
| CP29 | Hora de fin respecto de un inicio a las 09:00 | 08:59: se rechaza | 09:00: se rechaza | 09:01: se acepta |
| CP30 | Inicio respecto del final de otra reserva en la misma aula (09:00 a 10:00), con fin 11:00 | 09:59: se rechaza | 10:00: se acepta | 10:01: se acepta |
| CP31 | Fin respecto del comienzo de otra reserva en la misma aula (09:00 a 10:00), con inicio 08:00 | 09:01: se rechaza | 09:00: se acepta | 08:59: se acepta |
| CP32 | Último día de cursada (30/11/2026) | 01/12/2026: se rechaza | 30/11/2026: se acepta | 28/11/2026: se acepta (el 29 es domingo) |
| CP33 | Inicio de una reserva para hoy, respecto de la hora actual (08:00), con fin 09:00 | 07:59: se rechaza | 08:00: se rechaza | 08:01: se acepta |
| CP34 | Mínimo de caracteres del mensaje de un aviso (1) | 0: se rechaza | 1: se acepta | 2: se acepta |
| CP35 | Máximo de caracteres del mensaje de un aviso (255) | 256: se rechaza | 255: se acepta | 254: se acepta |

### 5.5.3 Gráfico causa-efecto
Relaciona causas (condiciones de entrada) con efectos (resultados) cuando varias condiciones interactúan. Se aplica a la liberación de una clase fija. Situación de prueba: el profesor es dueño de la comisión, y la reserva pide otra aula para el martes 17/11/2026 de 09:00 a 10:00. La clase fija, cuando existe, es los martes de 09:00 a 10:00 en el Aula A, y la reserva pide el Aula B.
| Causas (condiciones de entrada) | Efectos (condiciones de salida) |
| --- | --- |
| 1. La comisión tiene clase fija en esa fecha 2. El profesor confirma liberarla 3. Se cumplen las reglas de fecha, horario, capacidad y laboratorio 4. El aula y la comisión están libres | 100. Se guarda la reserva 101. Se guarda la liberación de la clase fija para esa fecha 102. Se pide confirmación y no se guarda nada 103. Se rechaza la solicitud con un mensaje y la clase fija no cambia |

Relaciones entre causas y efectos, usando los nodos intermedios "a" y "b":
- a = (NOT 1) OR 2
- b = a AND (NOT 4)
- 100 = a AND 3 AND 4
- 101 = 1 AND 2 AND 3 AND 4
- 102 = 1 AND (NOT 2) AND 3
- 103 = (NOT 3) OR b

Casos de prueba obtenidos del gráfico:
| Nro. | Causa 1 | Causa 2 | Causa 3 | Causa 4 | Efecto | Resultado esperado |
| --- | --- | --- | --- | --- | --- | --- |
| CP36 | No | No aplica | Sí | Sí | 100 | Se guarda la reserva. |
| CP37 | Sí | No | Sí | Sí | 102 | Se pregunta si se libera el Aula A para usar el Aula B. No se guarda nada. |
| CP38 | Sí | Sí | Sí | Sí | 100 y 101 | Se guardan la reserva y la liberación. La consulta de clases muestra el Aula B ese día; el Aula A sigue en las demás fechas. |
| CP39 | Sí | Sí | No | Sí | 103 | Se rechaza (por ejemplo, Aula B sin capacidad). La clase fija no cambia. |
| CP40 | Sí | Sí | Sí | No | 103 | Se rechaza porque el Aula B está ocupada. La clase fija no cambia. |
| CP41 | No | No aplica | No | Sí | 103 | Se rechaza con el mensaje de la regla incumplida. |
| CP42 | No | No aplica | Sí | No | 103 | Se rechaza porque el aula o la comisión están ocupadas. |
| CP43 | Sí | No | No | Sí | 103 | Se rechaza sin llegar a pedir confirmación. |
| CP44 | Sí | No | Sí | No | 102 | Se pide confirmación. Si el profesor confirma, se continúa como en CP40. |

### Cobertura
La cobertura mide qué porcentaje de la aplicación o de sus requisitos ejecutan las pruebas. El diseño cubre las 28 clases de equivalencia (al menos un caso por clase), 14 límites, entre ellos los de los tres turnos, y las combinaciones de causas de la liberación de una clase fija. El porcentaje ejecutado se obtiene al correr los 44 casos.
# 6. Conclusiones
Aulasys cuenta con una base organizada por capas y reglas de negocio que cubren los aspectos centrales de la asignación de aulas. Las mejoras propuestas no requieren reemplazar esa arquitectura. El mayor beneficio está en delimitar responsabilidades y dejar explícitas las decisiones que hoy dependen de una clase extensa, de un mensaje de texto o de una asignación directa de estado.
Priorizaríamos los errores con código claro y los cambios de estado de los avisos porque modifican comportamientos visibles y pueden definirse con casos concretos. Después separaríamos la consulta de clases y el trabajo de reservas. La separación de reglas merece una revisión cuidadosa: una mejor estructura no debe debilitar la protección frente a solicitudes simultáneas.
El costo de introducir un patrón debe justificarse. Strategy tiene sentido cuando aparecen políticas que cambian por separado. State puede ser útil si cada estado adquiere comportamiento propio, pero para tres estados una política en el enum resulta suficiente. Una interfaz aporta valor cuando separa un contrato de su implementación; crearla por cada clase agregaría trabajo sin resolver necesariamente un problema.