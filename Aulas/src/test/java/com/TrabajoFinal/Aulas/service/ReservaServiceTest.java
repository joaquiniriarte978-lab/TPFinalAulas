package com.TrabajoFinal.Aulas.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.TrabajoFinal.Aulas.Controller.ClasesController;
import com.TrabajoFinal.Aulas.Dtos.avisoDTO.AvisoRequestDTO;
import com.TrabajoFinal.Aulas.Dtos.comisionDTO.*;
import com.TrabajoFinal.Aulas.Dtos.reservaDTO.ReservaRequestDTO;
import com.TrabajoFinal.Aulas.Dtos.usuarioDTO.UsuarioRequestDTO;
import com.TrabajoFinal.Aulas.Repository.*;
import com.TrabajoFinal.Aulas.model.*;
import com.TrabajoFinal.Aulas.model.enums.*;

import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.context.annotation.*;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;

import java.time.*;
import java.util.*;
import java.util.concurrent.*;

@SpringBootTest(
        properties =
                "spring.datasource.url=${agenda.test.url:jdbc:h2:mem:agenda-test;MODE=MySQL;DB_CLOSE_DELAY=-1;LOCK_TIMEOUT=10000}")
@AutoConfigureMockMvc
@Import(ReservaServiceTest.Tiempo.class)
class ReservaServiceTest {
    @TestConfiguration
    static class Tiempo {
        @Bean
        @Primary
        Clock relojDePrueba() {
            return Clock.fixed(
                    Instant.parse("2026-10-19T08:00:00Z"),
                    ZoneId.of("America/Argentina/Buenos_Aires"));
        }
    }

    @Autowired ReservaService service;
    @Autowired ClaseFijaService claseService;
    @Autowired ComisionService comisionService;
    @Autowired ProfesorService profesorService;
    @Autowired UsuarioService usuarioService;
    @Autowired AvisoService avisoService;
    @Autowired ClasesController consulta;
    @Autowired ReservaRepository reservas;
    @Autowired ClaseFijaRepository clases;
    @Autowired ClaseFijaLiberadaRepository liberaciones;
    @Autowired ComisionRepository comisiones;
    @Autowired ProfesorRepository profesores;
    @Autowired UsuarioRepository usuarios;
    @Autowired MateriaRepository materias;
    @Autowired AulaRepository aulas;
    @Autowired AvisoRepository avisos;
    @Autowired AgendaRules agenda;
    @Autowired PlatformTransactionManager transactions;
    @Autowired MockMvc mvc;
    final LocalDate lunes = LocalDate.of(2026, 10, 19);
    Aula original, destino;
    Comision propia, ajena;
    Profesor profesor;
    Materia materia;

    @BeforeEach
    void datos() {
        new TransactionTemplate(transactions)
                .executeWithoutResult(
                        status -> {
                            avisos.deleteAll();
                            avisos.flush();
                            liberaciones.deleteAll();
                            liberaciones.flush();
                            reservas.deleteAll();
                            reservas.flush();
                            clases.deleteAll();
                            clases.flush();
                            comisiones.deleteAll();
                            comisiones.flush();
                            profesores.deleteAll();
                            profesores.flush();
                            usuarios.deleteAll();
                            usuarios.flush();
                            materias.deleteAll();
                            materias.flush();
                            aulas.deleteAll();
                            aulas.flush();
                            materia = materias.save(new Materia(null, "Programación", false));
                            usuarios.save(
                                    new Usuario(
                                            null, "Alumno", "alumno@test.com", "hash", Rol.ALUMNO));
                            var u =
                                    usuarios.save(
                                            new Usuario(
                                                    null,
                                                    "Ana",
                                                    "ana@test.com",
                                                    "hash",
                                                    Rol.PROFESOR));
                            profesor =
                                    profesores.save(
                                            new Profesor(
                                                    null,
                                                    u,
                                                    new ArrayList<>(List.of(materia)),
                                                    null));
                            var otro =
                                    usuarios.save(
                                            new Usuario(
                                                    null,
                                                    "Luis",
                                                    "luis@test.com",
                                                    "hash",
                                                    Rol.PROFESOR));
                            var p2 =
                                    profesores.save(
                                            new Profesor(
                                                    null,
                                                    otro,
                                                    new ArrayList<>(List.of(materia)),
                                                    null));
                            original =
                                    aulas.save(
                                            new Aula(
                                                    null,
                                                    "Aula Norte",
                                                    40,
                                                    Tipo.AULA,
                                                    "Proyector"));
                            destino =
                                    aulas.save(
                                            new Aula(null, "Aula Sur", 40, Tipo.LABORATORIO, "PC"));
                            propia =
                                    comisiones.save(
                                            new Comision(
                                                    null,
                                                    profesor,
                                                    materia,
                                                    20,
                                                    Horario.MAÑANA,
                                                    lunes.minusDays(1),
                                                    lunes.plusMonths(3)));
                            ajena =
                                    comisiones.save(
                                            new Comision(
                                                    null,
                                                    p2,
                                                    materia,
                                                    20,
                                                    Horario.MAÑANA,
                                                    lunes.minusDays(1),
                                                    lunes.plusMonths(3)));
                        });
    }

    ReservaRequestDTO pedido(
            Comision c, Aula a, LocalDate fecha, String inicio, String fin, boolean liberar) {
        var d = new ReservaRequestDTO();
        d.setId_comision(c.getId());
        d.setId_aula(a.getId());
        d.setFecha(fecha);
        d.setHoraInicio(LocalTime.parse(inicio));
        d.setHoraFin(LocalTime.parse(fin));
        d.setLiberarClaseFija(liberar);
        return d;
    }

    Reserva crear(Comision c, Aula a, LocalDate fecha, boolean liberar) {
        return service.hacerReserva(
                pedido(c, a, fecha, "08:00", "10:00", liberar),
                c.getProfesor().getUsuario().getEmail(),
                false);
    }

    ClaseFija fija() {
        var d = new ClaseFijaDTO();
        d.setId_comision(propia.getId());
        d.setId_aula(original.getId());
        d.setDiaSemana(DiaSemana.LUNES);
        d.setHoraInicio(LocalTime.of(8, 0));
        d.setHoraFin(LocalTime.of(10, 0));
        return claseService.crearOActualizar(d);
    }

    ComisionRequestDTO edicion() {
        var d = new ComisionRequestDTO();
        d.setId_profesor(profesor.getId());
        d.setId_materia(materia.getId());
        d.setCantAlumnos(20);
        d.setHorario(Horario.MAÑANA);
        d.setFechaInicio(propia.getFechaInicio());
        d.setFechaFin(propia.getFechaFin());
        return d;
    }

    @Test
    void confirmacionNoGuardaCambiosHastaAceptar() {
        fija();
        var e =
                assertThrows(
                        IllegalArgumentException.class, () -> crear(propia, destino, lunes, false));
        assertTrue(e.getMessage().startsWith("CONFIRMACION_LIBERAR_AULA:"));
        assertEquals(0, reservas.count());
        assertEquals(0, liberaciones.count());
        var r = crear(propia, destino, lunes, true);
        assertEquals(
                r.getId(),
                liberaciones.findByReservaId(r.getId()).orElseThrow().getReserva().getId());
        assertEquals(1, reservas.count());
        assertEquals(1, liberaciones.count());
    }

    @Test
    void destinoOcupadoRevierteReservaYLiberacion() {
        fija();
        crear(ajena, destino, lunes, false);
        assertThrows(IllegalArgumentException.class, () -> crear(propia, destino, lunes, true));
        assertEquals(1, reservas.count());
        assertEquals(0, liberaciones.count());
    }

    @Test
    void liberacionSoloAfectaFechaElegidaYAlumnoVeAulaEfectiva() throws Exception {
        fija();
        crear(propia, destino, lunes, true);
        assertEquals(destino.getId(), consulta.listar(lunes, null, null).getFirst().aulaId());
        assertEquals(
                original.getId(),
                consulta.listar(lunes.plusWeeks(1), null, null).getFirst().aulaId());
        crear(ajena, original, lunes, false);
        assertThrows(
                IllegalArgumentException.class,
                () -> crear(ajena, original, lunes.plusWeeks(1), false));
        mvc.perform(
                        get("/api/clases")
                                .param("fecha", lunes.toString())
                                .param("materiaId", materia.getId().toString())
                                .with(user("alumno").roles("ALUMNO")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(
                        content()
                                .string(
                                        org.hamcrest.Matchers.not(
                                                org.hamcrest.Matchers.containsString("hash"))));
        mvc.perform(
                        post("/api/reservas")
                                .with(user("alumno").roles("ALUMNO"))
                                .contentType("application/json")
                                .content("{}"))
                .andExpect(status().isForbidden());
        mvc.perform(get("/api/reservas").with(user("alumno").roles("ALUMNO")))
                .andExpect(status().isForbidden());
        mvc.perform(
                        post("/api/clase-fija")
                                .with(user("prof").roles("PROFESOR"))
                                .contentType("application/json")
                                .content("{}"))
                .andExpect(status().isForbidden());
    }

    @Test
    void editarExcluyeLaPropiaReservaYConservaLiberacion() {
        fija();
        var r = crear(propia, destino, lunes, true);
        service.modificarReserva(
                r.getId(),
                pedido(propia, destino, lunes, "08:00", "10:00", false),
                "ana@test.com",
                false);
        assertEquals(1, reservas.count());
        assertEquals(1, liberaciones.count());
        service.modificarReserva(
                r.getId(),
                pedido(propia, destino, lunes.plusDays(1), "08:00", "10:00", false),
                "ana@test.com",
                false);
        assertEquals(0, liberaciones.count());
        assertEquals(original.getId(), consulta.listar(lunes, null, null).getFirst().aulaId());
    }

    @Test
    void cancelarRestauraClaseFijaYQuitaReserva() {
        fija();
        var r = crear(propia, destino, lunes, true);
        service.cancelarReserva(r.getId(), "ana@test.com", false);
        assertEquals(0, reservas.count());
        assertEquals(0, liberaciones.count());
        assertEquals(original.getId(), consulta.listar(lunes, null, null).getFirst().aulaId());
    }

    @Test
    void cancelarUnaReservaAnteriorAlVinculoTambienRestauraLaClase() {
        fija();
        var r = crear(propia, destino, lunes, true);
        var l = liberaciones.findByReservaId(r.getId()).orElseThrow();
        l.setReserva(null);
        liberaciones.save(l);
        service.cancelarReserva(r.getId(), "ana@test.com", false);
        assertEquals(0, liberaciones.count());
        assertEquals(0, reservas.count());
        assertEquals(original.getId(), consulta.listar(lunes, null, null).getFirst().aulaId());
    }

    @Test
    void depurarHistorialConservaLaExcepcionDeLaClaseOriginal() {
        var cf = fija();
        var r = new Reserva();
        r.setComision(propia);
        r.setAula(destino);
        r.setFecha(lunes.minusWeeks(1));
        r.setHoraInicio(LocalTime.of(8, 0));
        r.setHoraFin(LocalTime.of(10, 0));
        r.setEstadoReserva(EstadoReserva.FINALIZADA);
        r = reservas.save(r);
        var l = new ClaseFijaLiberada();
        l.setClaseFija(cf);
        l.setFecha(r.getFecha());
        l.setReserva(r);
        liberaciones.save(l);
        service.eliminarReserva(r.getId(), "ana@test.com", false);
        assertEquals(0, reservas.count());
        assertEquals(1, liberaciones.count());
        assertNull(liberaciones.findAll().getFirst().getReserva());
    }

    @Test
    void restauracionOcupadaRevierteEdicionYCancelacion() {
        fija();
        var r = crear(propia, destino, lunes, true);
        crear(ajena, original, lunes, false);
        assertThrows(
                IllegalArgumentException.class,
                () -> service.cancelarReserva(r.getId(), "ana@test.com", false));
        assertThrows(
                IllegalArgumentException.class,
                () ->
                        service.modificarReserva(
                                r.getId(),
                                pedido(propia, destino, lunes.plusDays(1), "08:00", "10:00", false),
                                "ana@test.com",
                                false));
        assertEquals(lunes, reservas.findById(r.getId()).orElseThrow().getFecha());
        assertEquals(2, reservas.count());
        assertEquals(1, liberaciones.count());
    }

    @Test
    void dosSolicitudesSimultaneasNoDuplicanOcupacion() throws Exception {
        var ready = new CountDownLatch(2);
        var go = new CountDownLatch(1);
        try (var pool = Executors.newFixedThreadPool(2)) {
            var futures = new ArrayList<Future<Boolean>>();
            for (var c : List.of(propia, ajena))
                futures.add(
                        pool.submit(
                                () -> {
                                    ready.countDown();
                                    assertTrue(go.await(5, TimeUnit.SECONDS));
                                    try {
                                        crear(c, destino, lunes, false);
                                        return true;
                                    } catch (IllegalArgumentException conflicto) {
                                        return false;
                                    }
                                }));
            assertTrue(ready.await(5, TimeUnit.SECONDS));
            go.countDown();
            int ok = 0;
            for (var f : futures) if (f.get(15, TimeUnit.SECONDS)) ok++;
            assertEquals(1, ok);
            assertEquals(1, reservas.count());
        }
    }

    @Test
    void respetaTurnosCapacidadLaboratorioFechasYPropiedad() {
        assertThrows(
                IllegalArgumentException.class,
                () -> crear(propia, destino, lunes.minusDays(1), false));
        assertThrows(
                IllegalArgumentException.class,
                () -> crear(propia, destino, lunes.plusDays(6), false));
        assertThrows(
                IllegalArgumentException.class,
                () -> crear(propia, destino, lunes.plusMonths(4), false));
        assertThrows(
                IllegalArgumentException.class,
                () ->
                        service.hacerReserva(
                                pedido(propia, destino, lunes, "12:00", "13:01", false),
                                "ana@test.com",
                                false));
        assertThrows(
                IllegalArgumentException.class,
                () ->
                        service.hacerReserva(
                                pedido(propia, destino, lunes, "10:00", "09:00", false),
                                "ana@test.com",
                                false));
        assertThrows(
                AccessDeniedException.class,
                () ->
                        service.hacerReserva(
                                pedido(propia, destino, lunes, "08:00", "10:00", false),
                                "luis@test.com",
                                false));
        original.setCapacidad(10);
        aulas.save(original);
        assertThrows(IllegalArgumentException.class, () -> crear(propia, original, lunes, false));
        original.setCapacidad(40);
        aulas.save(original);
        materia.setRequiereLaboratorio(true);
        materias.save(materia);
        assertThrows(IllegalArgumentException.class, () -> crear(propia, original, lunes, false));
        var r = crear(propia, destino, lunes, false);
        assertThrows(
                AccessDeniedException.class,
                () -> service.cancelarReserva(r.getId(), "luis@test.com", false));
        assertThrows(
                AccessDeniedException.class,
                () ->
                        service.modificarReserva(
                                r.getId(),
                                pedido(propia, destino, lunes, "09:00", "11:00", false),
                                "luis@test.com",
                                false));
    }

    @Test
    void limitesDeLosTresTurnosYReservasContiguas() {
        for (var turno : Horario.values()) {
            propia.setHorario(turno);
            comisiones.save(propia);
            String inicio =
                    switch (turno) {
                        case MAÑANA -> "06:00";
                        case TARDE -> "13:00";
                        case NOCHE -> "19:00";
                    };
            String fin =
                    switch (turno) {
                        case MAÑANA -> "13:00";
                        case TARDE -> "19:00";
                        case NOCHE -> "23:59";
                    };
            var d = pedido(propia, destino, lunes, inicio, fin, false);
            var r = service.hacerReserva(d, "ana@test.com", false);
            service.cancelarReserva(r.getId(), "ana@test.com", false);
        }
        propia.setHorario(Horario.MAÑANA);
        comisiones.save(propia);
        crear(propia, destino, lunes, false);
        service.hacerReserva(
                pedido(ajena, destino, lunes, "10:00", "11:00", false), "luis@test.com", false);
        assertEquals(2, reservas.count());
    }

    @Test
    void bloqueaRolMateriaYComisionQueInvalidenLaAgenda() {
        fija();
        var r = crear(propia, destino, lunes, true);
        var u = new UsuarioRequestDTO();
        u.setNombre("Ana");
        u.setEmail("ana@test.com");
        u.setRol("ALUMNO");
        assertThrows(
                IllegalArgumentException.class,
                () -> usuarioService.modificar(profesor.getUsuario().getId(), u));
        assertEquals(
                Rol.PROFESOR,
                usuarios.findById(profesor.getUsuario().getId()).orElseThrow().getRol());
        assertThrows(
                IllegalArgumentException.class,
                () -> profesorService.asignar(profesor.getId(), List.of()));
        var d = edicion();
        d.setCantAlumnos(50);
        assertThrows(
                IllegalArgumentException.class,
                () -> comisionService.actualizar(propia.getId(), d));
        assertEquals(20, comisiones.findById(propia.getId()).orElseThrow().getCantAlumnos());
        assertThrows(
                IllegalArgumentException.class,
                () -> claseService.eliminarPorComision(propia.getId()));
        assertNotNull(reservas.findById(r.getId()).orElseThrow());
    }

    @Test
    void profesoresUsanIdPropioYDedupliquenMaterias() {
        // La identidad de profesor y de usuario se resuelven por campos diferentes.
        var d =
                profesorService.asignar(
                        profesor.getId(), List.of(materia.getId(), materia.getId()));
        assertEquals(profesor.getId(), d.id());
        assertEquals(profesor.getUsuario().getId(), d.usuarioId());
        assertEquals(List.of(materia.getId()), d.materiasIds());
        assertThrows(
                IllegalArgumentException.class,
                () -> profesorService.asignar(profesor.getId(), List.of(-1)));
    }

    @Test
    void finalizaHistorialYAutorDeAvisoSeConserva() {
        var r = new Reserva();
        r.setComision(propia);
        r.setAula(destino);
        r.setFecha(lunes.minusDays(2));
        r.setHoraInicio(LocalTime.of(8, 0));
        r.setHoraFin(LocalTime.of(10, 0));
        r.setEstadoReserva(EstadoReserva.RESERVADA);
        r = reservas.save(r);
        service.finalizarReservasVencidas();
        assertEquals(
                EstadoReserva.FINALIZADA,
                reservas.findById(r.getId()).orElseThrow().getEstadoReserva());
        assertEquals(0, service.listarReservas("luis@test.com", false).size());
        assertEquals(1, service.listarReservas("ana@test.com", false).size());
        var d = new AvisoRequestDTO();
        d.setId_aula(destino.getId());
        d.setMensaje("El proyector no enciende.");
        var aviso = avisoService.guardarAviso(d, "ana@test.com");
        assertThrows(
                AccessDeniedException.class,
                () -> avisoService.modificarAvisoProfesor(aviso.getId(), d, "luis@test.com"));
        d.setMensaje("El proyector sigue sin encender.");
        var editado = avisoService.modificarAvisoProfesor(aviso.getId(), d, "ana@test.com");
        assertEquals(aviso.getFecha(), editado.getFecha());
        assertEquals(Estado.PENDIENTE, editado.getEstado());
        assertEquals(profesor.getUsuario().getId(), editado.getUsuario().getId());
        service.eliminarReserva(r.getId(), "ana@test.com", false);
        assertEquals(0, reservas.count());
    }
}
