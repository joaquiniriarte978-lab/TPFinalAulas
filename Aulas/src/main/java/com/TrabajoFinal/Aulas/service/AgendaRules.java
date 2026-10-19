package com.TrabajoFinal.Aulas.service;

import com.TrabajoFinal.Aulas.Repository.*;
import com.TrabajoFinal.Aulas.model.*;
import com.TrabajoFinal.Aulas.model.enums.*;

import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;

import java.time.*;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class AgendaRules {
    private final AulaRepository aulas;
    private final ClaseFijaRepository clases;
    private final ReservaRepository reservas;
    private final ClaseFijaLiberadaRepository liberaciones;
    private final Clock clock;

    // Todos los cambios de agenda toman los mismos bloqueos, en orden, antes de validar.
    public void bloquear() {
        aulas.bloquearAgenda();
    }

    public LocalDate hoy() {
        return LocalDate.now(clock);
    }

    public LocalTime ahora() {
        return LocalTime.now(clock);
    }

    public boolean termino(Reserva r) {
        return !r.getFecha().atTime(r.getHoraFin()).isAfter(LocalDateTime.now(clock));
    }

    public boolean vigente(Comision c, LocalDate fecha) {
        return !fecha.isBefore(c.getFechaInicio()) && !fecha.isAfter(c.getFechaFin());
    }

    public DiaSemana dia(LocalDate fecha) {
        if (fecha.getDayOfWeek() == DayOfWeek.SUNDAY)
            throw new IllegalArgumentException("No hay clases los domingos.");
        return DiaSemana.values()[fecha.getDayOfWeek().getValue() - 1];
    }

    public boolean ocurre(ClaseFija cf, LocalDate fecha) {
        return fecha.getDayOfWeek() != DayOfWeek.SUNDAY
                && vigente(cf.getComision(), fecha)
                && cf.getDiaSemana() == dia(fecha);
    }

    public boolean liberada(ClaseFija cf, LocalDate fecha) {
        return liberaciones.findByClaseFijaIdAndFecha(cf.getId(), fecha).isPresent();
    }

    public void validar(Comision c, Aula a, LocalTime inicio, LocalTime fin) {
        if (inicio == null || fin == null || !fin.isAfter(inicio))
            throw new IllegalArgumentException("La hora de fin debe ser posterior al inicio.");
        LocalTime apertura =
                switch (c.getHorario()) {
                    case MAÑANA -> LocalTime.of(6, 0);
                    case TARDE -> LocalTime.of(13, 0);
                    case NOCHE -> LocalTime.of(19, 0);
                };
        LocalTime cierre =
                switch (c.getHorario()) {
                    case MAÑANA -> LocalTime.of(13, 0);
                    case TARDE -> LocalTime.of(19, 0);
                    case NOCHE -> LocalTime.of(23, 59);
                };
        if (inicio.isBefore(apertura) || fin.isAfter(cierre))
            throw new IllegalArgumentException(
                    "El horario debe estar dentro del turno "
                            + c.getHorario()
                            + " ("
                            + apertura
                            + "–"
                            + cierre
                            + ").");
        if (a.getCapacidad() < c.getCantAlumnos())
            throw new IllegalArgumentException("El aula no tiene capacidad para la comisión.");
        if (c.getMateria().isRequiereLaboratorio()
                && !(a.getTipo() == Tipo.LABORATORIO
                        || a.getTipo() == Tipo.LABORATORIO_TEXTIL
                        || a.getTipo() == Tipo.LABORATORIO_IDIOMAS))
            throw new IllegalArgumentException("La materia requiere un laboratorio.");
    }

    public boolean solapa(LocalTime a, LocalTime b, LocalTime c, LocalTime d) {
        return a.isBefore(d) && b.isAfter(c);
    }

    public void ocupacion(
            Comision c,
            Aula a,
            LocalDate fecha,
            LocalTime inicio,
            LocalTime fin,
            Integer reservaExcluida,
            Integer claseExcluida) {
        for (Reserva r : reservas.findByFecha(fecha)) {
            if (Objects.equals(r.getId(), reservaExcluida)
                    || r.getEstadoReserva() != EstadoReserva.RESERVADA) continue;
            if ((r.getAula().getId().equals(a.getId()) || r.getComision().getId().equals(c.getId()))
                    && solapa(inicio, fin, r.getHoraInicio(), r.getHoraFin()))
                throw new IllegalArgumentException(
                        "El aula o la comisión ya tiene una reserva en ese horario.");
        }
        for (ClaseFija cf : clases.findAll()) {
            if (Objects.equals(cf.getId(), claseExcluida)
                    || !ocurre(cf, fecha)
                    || liberada(cf, fecha)) continue;
            if ((cf.getAula().getId().equals(a.getId())
                            || cf.getComision().getId().equals(c.getId()))
                    && solapa(inicio, fin, cf.getHoraInicio(), cf.getHoraFin()))
                throw new IllegalArgumentException(
                        "El aula o la comisión tiene una clase fija en ese horario.");
        }
    }

    public void validarSemanal(ClaseFija cf) {
        validar(cf.getComision(), cf.getAula(), cf.getHoraInicio(), cf.getHoraFin());
        LocalDate desde =
                cf.getComision().getFechaInicio().isBefore(hoy())
                        ? hoy()
                        : cf.getComision().getFechaInicio();
        for (LocalDate fecha = desde;
                !fecha.isAfter(cf.getComision().getFechaFin());
                fecha = fecha.plusDays(1)) {
            if (ocurre(cf, fecha) && (cf.getId() == null || !liberada(cf, fecha)))
                ocupacion(
                        cf.getComision(),
                        cf.getAula(),
                        fecha,
                        cf.getHoraInicio(),
                        cf.getHoraFin(),
                        null,
                        cf.getId());
        }
    }
}
