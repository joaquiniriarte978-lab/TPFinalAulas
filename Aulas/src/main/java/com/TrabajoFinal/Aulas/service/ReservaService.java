package com.TrabajoFinal.Aulas.service;

import com.TrabajoFinal.Aulas.Dtos.reservaDTO.*;
import com.TrabajoFinal.Aulas.Repository.*;
import com.TrabajoFinal.Aulas.exceptions.ResourceNotFoundException;
import com.TrabajoFinal.Aulas.model.*;
import com.TrabajoFinal.Aulas.model.enums.*;

import lombok.RequiredArgsConstructor;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
@RequiredArgsConstructor
public class ReservaService {
    private final ReservaRepository reservas;
    private final ComisionRepository comisiones;
    private final AulaRepository aulas;
    private final ClaseFijaRepository clases;
    private final ClaseFijaLiberadaRepository liberaciones;
    private final AgendaRules agenda;

    @Transactional
    public Reserva hacerReserva(ReservaRequestDTO dto, String email, boolean admin) {
        agenda.bloquear();
        return guardar(new Reserva(), dto, email, admin);
    }

    @Transactional
    public Reserva modificarReserva(
            Integer id, ReservaRequestDTO dto, String email, boolean admin) {
        agenda.bloquear();
        Reserva r = listarXId(id);
        permiso(r.getComision(), email, admin);
        if (agenda.termino(r) || r.getEstadoReserva() != EstadoReserva.RESERVADA)
            throw new IllegalArgumentException("Solo se pueden modificar reservas activas.");
        return guardar(r, dto, email, admin);
    }

    private Reserva guardar(Reserva r, ReservaRequestDTO dto, String email, boolean admin) {
        Comision c =
                comisiones
                        .findById(dto.getId_comision())
                        .orElseThrow(
                                () ->
                                        new ResourceNotFoundException(
                                                "Comisión", dto.getId_comision()));
        permiso(c, email, admin);
        if (c.getProfesor().getUsuario().getRol() != Rol.PROFESOR)
            throw new IllegalArgumentException("La comisión no tiene un profesor habilitado.");
        Aula a =
                aulas.findById(dto.getId_aula())
                        .orElseThrow(() -> new ResourceNotFoundException("Aula", dto.getId_aula()));
        agenda.dia(dto.getFecha());
        if (dto.getFecha().isBefore(agenda.hoy())
                || (dto.getFecha().equals(agenda.hoy())
                        && !dto.getHoraInicio().isAfter(agenda.ahora())))
            throw new IllegalArgumentException("La reserva debe comenzar en el futuro.");
        if (!agenda.vigente(c, dto.getFecha()))
            throw new IllegalArgumentException("La fecha está fuera de la cursada.");
        agenda.validar(c, a, dto.getHoraInicio(), dto.getHoraFin());
        ClaseFija cf =
                clases.findByComisionId(c.getId())
                        .filter(f -> agenda.ocurre(f, dto.getFecha()))
                        .orElse(null);
        ClaseFijaLiberada anterior = r.getId() == null ? null : liberacionDe(r);
        ClaseFijaLiberada nueva = null;
        if (cf != null) {
            if (cf.getAula().getId().equals(a.getId())
                    && cf.getHoraInicio().equals(dto.getHoraInicio())
                    && cf.getHoraFin().equals(dto.getHoraFin()))
                throw new IllegalArgumentException(
                        "Ese horario ya está cubierto por la clase fija.");
            nueva = liberaciones.findByClaseFijaIdAndFecha(cf.getId(), dto.getFecha()).orElse(null);
            if (nueva != null
                    && (anterior == null || !Objects.equals(nueva.getId(), anterior.getId())))
                throw new IllegalArgumentException(
                        "La comisión ya tiene un cambio de aula para esa fecha. Editá esa"
                            + " reserva.");
            if (nueva == null) {
                if (!Boolean.TRUE.equals(dto.getLiberarClaseFija()))
                    throw new IllegalArgumentException(
                            "CONFIRMACION_LIBERAR_AULA: El "
                                    + dto.getFecha()
                                    + " se liberará "
                                    + cf.getAula().getNombre()
                                    + " para usar "
                                    + a.getNombre()
                                    + ".");
                nueva = new ClaseFijaLiberada();
                nueva.setClaseFija(cf);
                nueva.setFecha(dto.getFecha());
            }
        }
        agenda.ocupacion(
                c,
                a,
                dto.getFecha(),
                dto.getHoraInicio(),
                dto.getHoraFin(),
                r.getId(),
                cf == null ? null : cf.getId());
        r.setComision(c);
        r.setAula(a);
        r.setFecha(dto.getFecha());
        r.setHoraInicio(dto.getHoraInicio());
        r.setHoraFin(dto.getHoraFin());
        r.setEstadoReserva(EstadoReserva.RESERVADA);
        Reserva saved = reservas.saveAndFlush(r);
        if (anterior != null
                && (nueva == null || !Objects.equals(anterior.getId(), nueva.getId()))) {
            restaurar(
                    anterior,
                    null); // Incluye la reserva recién editada al comprobar la restauración.
            liberaciones.delete(anterior);
            liberaciones.flush();
        }
        if (nueva != null) {
            nueva.setReserva(saved);
            liberaciones.save(nueva);
        }
        return saved;
    }

    private void restaurar(ClaseFijaLiberada l, Integer reservaExcluida) {
        if (l.getFecha().isBefore(agenda.hoy())) return;
        ClaseFija cf = l.getClaseFija();
        if (agenda.ocurre(cf, l.getFecha()))
            agenda.ocupacion(
                    cf.getComision(),
                    cf.getAula(),
                    l.getFecha(),
                    cf.getHoraInicio(),
                    cf.getHoraFin(),
                    reservaExcluida,
                    cf.getId());
    }

    private ClaseFijaLiberada liberacionDe(Reserva r) {
        var vinculada = liberaciones.findByReservaId(r.getId()).orElse(null);
        if (vinculada != null) return vinculada;
        // Compatibilidad con las liberaciones anteriores al vínculo con Reserva.
        var antigua =
                clases.findByComisionId(r.getComision().getId())
                        .flatMap(
                                cf ->
                                        liberaciones.findByClaseFijaIdAndFecha(
                                                cf.getId(), r.getFecha()))
                        .filter(l -> l.getReserva() == null)
                        .orElse(null);
        if (antigua == null) return null;
        long candidatas =
                reservas.findByComisionId(r.getComision().getId()).stream()
                        .filter(otra -> otra.getFecha().equals(r.getFecha()))
                        .count();
        if (candidatas != 1)
            throw new IllegalArgumentException(
                    "Hay varias reservas vinculables a la liberación de esa fecha. Revisá su"
                        + " asociación antes de modificarla.");
        antigua.setReserva(r);
        return liberaciones.saveAndFlush(antigua);
    }

    public void permiso(Comision c, String email, boolean admin) {
        if (!admin && !c.getProfesor().getUsuario().getEmail().equals(email))
            throw new AccessDeniedException("La reserva pertenece a otro profesor.");
    }

    public Reserva listarXId(Integer id) {
        return reservas.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Reserva", id));
    }

    public boolean visible(Reserva r, String email, boolean admin) {
        return admin
                || !agenda.termino(r)
                || r.getComision().getProfesor().getUsuario().getEmail().equals(email);
    }

    @Transactional
    public List<Reserva> listarReservas(String email, boolean admin) {
        agenda.bloquear();
        finalizar();
        return reservas.findAll().stream().filter(r -> visible(r, email, admin)).toList();
    }

    @Transactional
    public void cancelarReserva(Integer id, String email, boolean admin) {
        agenda.bloquear();
        Reserva r = listarXId(id);
        permiso(r.getComision(), email, admin);
        if (agenda.termino(r) || r.getEstadoReserva() != EstadoReserva.RESERVADA)
            throw new IllegalArgumentException("La reserva ya finalizó.");
        var l = liberacionDe(r);
        if (l != null) {
            restaurar(l, id);
            liberaciones.delete(l);
            liberaciones.flush();
        }
        reservas.delete(r);
    }

    @Transactional
    public void eliminarReserva(Integer id, String email, boolean admin) {
        agenda.bloquear();
        Reserva r = listarXId(id);
        permiso(r.getComision(), email, admin);
        if (!agenda.termino(r))
            throw new IllegalArgumentException("Solo se pueden eliminar reservas finalizadas.");
        // Conserva la excepción histórica para no volver a mostrar la antigua clase fija.
        var l = liberacionDe(r);
        if (l != null) {
            l.setReserva(null);
            liberaciones.saveAndFlush(l);
        }
        reservas.delete(r);
    }

    @Scheduled(fixedRate = 60000)
    @Transactional
    public void finalizarReservasVencidas() {
        agenda.bloquear();
        finalizar();
    }

    private void finalizar() {
        var vencidas = reservas.findReservasVencidas(agenda.hoy(), agenda.ahora());
        vencidas.forEach(r -> r.setEstadoReserva(EstadoReserva.FINALIZADA));
        reservas.saveAll(vencidas);
    }

    public ReservaResponseDTO dto(Reserva r, String email, boolean admin) {
        var d = new ReservaResponseDTO();
        d.setId(r.getId());
        d.setId_comision(r.getComision().getId());
        d.setId_aula(r.getAula().getId());
        d.setFecha(r.getFecha());
        d.setHoraInicio(r.getHoraInicio());
        d.setHoraFin(r.getHoraFin());
        d.setAulaNombre(r.getAula().getNombre());
        d.setMateriaNombre(r.getComision().getMateria().getNombre());
        d.setProfesorNombre(r.getComision().getProfesor().getUsuario().getNombre());
        d.setEstadoReserva(agenda.termino(r) ? EstadoReserva.FINALIZADA : r.getEstadoReserva());
        d.setPropia(r.getComision().getProfesor().getUsuario().getEmail().equals(email));
        d.setEditable((admin || d.isPropia()) && !agenda.termino(r));
        return d;
    }
}
