package com.TrabajoFinal.Aulas.service;

import com.TrabajoFinal.Aulas.Dtos.reservaDTO.ReservaResponseDTO;
import com.TrabajoFinal.Aulas.Repository.*;
import com.TrabajoFinal.Aulas.exceptions.ResourceNotFoundException;
import com.TrabajoFinal.Aulas.model.*;
import com.TrabajoFinal.Aulas.model.enums.DiaSemana;
import com.TrabajoFinal.Aulas.model.enums.EstadoReserva;
import com.TrabajoFinal.Aulas.model.enums.Horario;
import com.TrabajoFinal.Aulas.model.enums.Tipo;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ReservaService {
    private final ReservaRepository reservaRepository;
    private final ComisionRepository comisionRepository;
    private final AulaRepository aulaRepository;
    private final ClaseFijaRepository claseFijaRepository;
    private final ClaseFijaLiberadaRepository claseFijaLiberadaRepository;

    public Reserva hacerReserva(ReservaResponseDTO dto, String emailUsuario, boolean esAdmin){
        Comision comision = comisionRepository.findById(dto.getId_comision())
                .orElseThrow(() -> new ResourceNotFoundException("Comision", dto.getId_comision()));
        if (!esAdmin) {
            String emailProfesor = comision.getProfesor().getUsuario().getEmail();
            if (!emailProfesor.equals(emailUsuario)) {
                throw new RuntimeException("No tienes permiso para crear reservas de una comisión que no dictas.");
            }
        }
        Aula aula = aulaRepository.findById(dto.getId_aula())
                .orElseThrow(() -> new ResourceNotFoundException("Aula", dto.getId_aula()));


        if (!dto.getHoraFin().isAfter(dto.getHoraInicio())) {
            throw new RuntimeException("La hora de fin debe ser posterior a la hora de inicio.");
        }else if (dto.getFecha().isBefore(LocalDate.now())){
            throw new RuntimeException("La fecha de la reserva debe ser posterior a la fecha actual");
        }else if (dto.getFecha().isEqual(LocalDate.now()) && dto.getHoraInicio().isBefore(LocalTime.now())){
            throw new RuntimeException("La hora de inicio de la reserva debe ser posterior a la hora actual");
        }

        validarHorarioComision(comision.getHorario(), dto.getHoraInicio(), dto.getHoraFin());

        boolean materiaRequiereLab = comision.getMateria().isRequiereLaboratorio();
        boolean aulaEsLaboratorio  = aula.getTipo() == Tipo.LABORATORIO
                || aula.getTipo() == Tipo.LABORATORIO_TEXTIL
                || aula.getTipo() == Tipo.LABORATORIO_IDIOMAS;

        if (materiaRequiereLab && !aulaEsLaboratorio) {
            throw new RuntimeException(
                    "La materia '" + comision.getMateria().getNombre() +
                            "' requiere laboratorio, pero el aula '" + aula.getNombre() +
                            "' es de tipo " + aula.getTipo() + ".");
        }

        if (aula.getCapacidad() < comision.getCantAlumnos()) {
            throw new RuntimeException(
                    "El aula '" + aula.getNombre() + "' tiene capacidad para " + aula.getCapacidad() +
                            " personas, pero la comisión tiene " + comision.getCantAlumnos() + " alumnos.");
        }

        if (reservaRepository.existeConflicto(
                dto.getId_aula(), dto.getFecha(), dto.getHoraInicio(), dto.getHoraFin())) {
            throw new RuntimeException(
                    "El aula ya tiene una reserva activa en ese horario.");
        }

        DiaSemana diaSemana = toDiaSemana(dto.getFecha().getDayOfWeek());
        Integer excluidoClaseFijaId = null;
        ClaseFija claseFijaDeComision = claseFijaRepository.findByComisionId(dto.getId_comision()).orElse(null);
        boolean yaLiberada = false;
        if (claseFijaDeComision != null && claseFijaDeComision.getDiaSemana() == diaSemana) {
            yaLiberada = claseFijaLiberadaRepository.findByClaseFijaIdAndFecha(
                    claseFijaDeComision.getId(), dto.getFecha()).isPresent();
            if (dto.getLiberarClaseFija() != null && dto.getLiberarClaseFija()) {
                // User wants to liberate the class fixed for this day
                if (!yaLiberada) {
                    // Create the liberation record
                    ClaseFijaLiberada liberacion = new ClaseFijaLiberada();
                    liberacion.setClaseFija(claseFijaDeComision);
                    liberacion.setFecha(dto.getFecha());
                    claseFijaLiberadaRepository.save(liberacion);
                }
                excluidoClaseFijaId = claseFijaDeComision.getId();
            } else if (!yaLiberada) {
                // Class fixed exists for this day, not liberated, and user did not ask to liberate
                throw new RuntimeException("CONFIRMACION_LIBERAR_AULA: Esta comisión ya tiene una clase fija hoy. ¿Deseas liberar tu aula fija por este día?");
            } else {
                // It is already liberated, so exclude it from conflict check
                excluidoClaseFijaId = claseFijaDeComision.getId();
            }
        }
        boolean conflictoo = claseFijaRepository.existeConflictoExcluyendo(
                dto.getId_aula(), diaSemana, dto.getHoraInicio(), dto.getHoraFin(), excluidoClaseFijaId);
        if (conflictoo) {
            throw new RuntimeException(
                    "El aula tiene una clase fija los " + diaSemana.name().toLowerCase() + " en ese horario.");
        }

        Reserva reserva = new Reserva();
        reserva.setComision(comision);
        reserva.setAula(aula);
        reserva.setFecha(dto.getFecha());
        reserva.setHoraFin(dto.getHoraFin());
        reserva.setHoraInicio(dto.getHoraInicio());
        reserva.setEstadoReserva(EstadoReserva.RESERVADA);
        return reservaRepository.save(reserva);
    }

    public List<Reserva>listarReservas(){
        return reservaRepository.findAll();
    }
    public Reserva listarXId(Integer id){
        return reservaRepository.findById(id)
                .orElseThrow(()->new ResourceNotFoundException("Reserva", id));
    }
    public Reserva modificarReserva(Integer id, ReservaResponseDTO reservaNueva, String emailUsuario, boolean esAdmin){
        // First, find existing reservation to check ownership
        Reserva existente = listarXId(id);
        if (!esAdmin) {
            String emailProfesorExistente = existente.getComision()
                    .getProfesor().getUsuario().getEmail();
            if (!emailProfesorExistente.equals(emailUsuario)) {
                throw new RuntimeException("No tienes permiso para modificar reservas de una comisión que no dictas.");
            }
        }
        // If commission is being changed, also validate new commission ownership
        if (!reservaNueva.getId_comision().equals(existente.getComision().getId())) {
            Comision comisionNueva = comisionRepository.findById(reservaNueva.getId_comision())
                    .orElseThrow(() -> new ResourceNotFoundException("Comision", reservaNueva.getId_comision()));
            if (!esAdmin) {
                String emailProfesorNuevo = comisionNueva.getProfesor().getUsuario().getEmail();
                if (!emailProfesorNuevo.equals(emailUsuario)) {
                    throw new RuntimeException("No tienes permiso para crear reservas de una comisión que no dictas.");
                }
            }
        }

        Comision comision = comisionRepository.findById(reservaNueva.getId_comision())
                .orElseThrow(() -> new ResourceNotFoundException("Comision", reservaNueva.getId_comision()));
        Aula aula = aulaRepository.findById(reservaNueva.getId_aula())
                .orElseThrow(() -> new ResourceNotFoundException("Aula", reservaNueva.getId_aula()));


        if (!reservaNueva.getHoraFin().isAfter(reservaNueva.getHoraInicio())) {
            throw new RuntimeException("La hora de fin debe ser posterior a la hora de inicio.");
        }else if (reservaNueva.getFecha().isBefore(LocalDate.now())){
            throw new RuntimeException("La fecha de la reserva debe ser posterior a la fecha actual");
        }else if (reservaNueva.getFecha().isEqual(LocalDate.now()) && reservaNueva.getHoraInicio().isBefore(LocalTime.now())){
            throw new RuntimeException("La hora de inicio de la reserva debe ser posterior a la hora actual");
        }

        validarHorarioComision(comision.getHorario(), reservaNueva.getHoraInicio(), reservaNueva.getHoraFin());

        boolean materiaRequiereLab = comision.getMateria().isRequiereLaboratorio();
        boolean aulaEsLaboratorio  = aula.getTipo() == Tipo.LABORATORIO
                || aula.getTipo() == Tipo.LABORATORIO_TEXTIL
                || aula.getTipo() == Tipo.LABORATORIO_IDIOMAS;

        if (materiaRequiereLab && !aulaEsLaboratorio) {
            throw new RuntimeException(
                    "La materia '" + comision.getMateria().getNombre() +
                            "' requiere laboratorio, pero el aula '" + aula.getNombre() +
                            "' es de tipo " + aula.getTipo() + ".");
        }

        if (aula.getCapacidad() < comision.getCantAlumnos()) {
            throw new RuntimeException(
                    "El aula '" + aula.getNombre() + "' tiene capacidad para " + aula.getCapacidad() +
                            " personas, pero la comisión tiene " + comision.getCantAlumnos() + " alumnos.");
        }

        boolean conflicto = reservaRepository.existeConflicto(
                reservaNueva.getId_aula(),
                reservaNueva.getFecha(),
                reservaNueva.getHoraInicio(),
                reservaNueva.getHoraFin());

        if (conflicto) {
            Reserva actual = listarXId(id);
            boolean esConsigoMisma =
                    actual.getAula().getId().equals(reservaNueva.getId_aula()) &&
                            actual.getFecha().equals(reservaNueva.getFecha()) &&
                            actual.getHoraInicio().equals(reservaNueva.getHoraInicio()) &&
                            actual.getHoraFin().equals(reservaNueva.getHoraFin());

            if (!esConsigoMisma) {
                throw new RuntimeException(
                        "El aula ya tiene una reserva activa en ese horario.");
            }
        }

        DiaSemana diaSemana = toDiaSemana(reservaNueva.getFecha().getDayOfWeek());
        Integer excluidoClaseFijaId = null;
        ClaseFija claseFijaDeComision = claseFijaRepository.findByComisionId(reservaNueva.getId_comision()).orElse(null);
        boolean yaLiberada = false;
        if (claseFijaDeComision != null && claseFijaDeComision.getDiaSemana() == diaSemana) {
            yaLiberada = claseFijaLiberadaRepository.findByClaseFijaIdAndFecha(
                    claseFijaDeComision.getId(), reservaNueva.getFecha()).isPresent();
            if (reservaNueva.getLiberarClaseFija() != null && reservaNueva.getLiberarClaseFija()) {
                // User wants to liberate the class fixed for this day
                if (!yaLiberada) {
                    // Create the liberation record
                    ClaseFijaLiberada liberacion = new ClaseFijaLiberada();
                    liberacion.setClaseFija(claseFijaDeComision);
                    liberacion.setFecha(reservaNueva.getFecha());
                    claseFijaLiberadaRepository.save(liberacion);
                }
                excluidoClaseFijaId = claseFijaDeComision.getId();
            } else if (!yaLiberada) {
                throw new RuntimeException("CONFIRMACION_LIBERAR_AULA: Esta comisión ya tiene una clase fija hoy. ¿Deseas liberar tu aula fija por este día?");
            } else {
                excluidoClaseFijaId = claseFijaDeComision.getId();
            }
        }
        boolean conflictoo = claseFijaRepository.existeConflictoExcluyendo(
                reservaNueva.getId_aula(), diaSemana, reservaNueva.getHoraInicio(), reservaNueva.getHoraFin(), excluidoClaseFijaId);
        if (conflictoo) {
            throw new RuntimeException(
                    "El aula tiene una clase fija los " + diaSemana.name().toLowerCase() + " en ese horario.");
        }
        Reserva reservaVieja = listarXId(id);
        reservaVieja.setFecha(reservaNueva.getFecha());
        reservaVieja.setHoraFin(reservaNueva.getHoraFin());
        reservaVieja.setHoraInicio(reservaNueva.getHoraInicio());
        reservaVieja.setComision(comision);
        reservaVieja.setAula(aula);
        return reservaRepository.save(reservaVieja);
    }
    public Reserva cancelarReserva(Integer id, String emailUsuario, boolean esAdmin) {
        Reserva reserva = listarXId(id);

        if (!esAdmin) {
            String emailProfesorReserva = reserva.getComision()
                    .getProfesor().getUsuario().getEmail();

            if (!emailProfesorReserva.equals(emailUsuario)) {
                throw new RuntimeException("No tenés permiso para cancelar esta reserva.");
            }
        }

        if (reserva.getEstadoReserva().equals(EstadoReserva.RESERVADA)) {
            reserva.setEstadoReserva(EstadoReserva.CANCELADA);
            return reservaRepository.save(reserva);
        } else {
            throw new RuntimeException("La reserva no está reservada.");
        }
    }

    public void eliminarReserva(Integer id, String emailUsuario, boolean esAdmin){
        Reserva reserva = listarXId(id);
        if (!esAdmin) {
            String emailProfesorReserva = reserva.getComision()
                    .getProfesor().getUsuario().getEmail();
            if (!emailProfesorReserva.equals(emailUsuario)) {
                throw new RuntimeException("No tienes permiso para eliminar reservas de una comisión que no dictas.");
            }
        }
        reservaRepository.deleteById(id);
    }

    public List<Reserva> listarPorMateria(Integer idMateria) {
        return reservaRepository.findReservasByMateria(idMateria);
    }

    private DiaSemana toDiaSemana(DayOfWeek day) {
        return switch (day) {
            case MONDAY    -> DiaSemana.LUNES;
            case TUESDAY   -> DiaSemana.MARTES;
            case WEDNESDAY -> DiaSemana.MIERCOLES;
            case THURSDAY  -> DiaSemana.JUEVES;
            case FRIDAY    -> DiaSemana.VIERNES;
            case SATURDAY  -> DiaSemana.SABADO;
            default -> throw new RuntimeException("No se pueden hacer reservas los domingos.");
        };
    }

    private void validarHorarioComision(Horario horario, LocalTime inicio, LocalTime fin) {
        LocalTime apertura;
        LocalTime cierre;
        String nombreHorario;

        switch (horario) {
            case MAÑANA -> { apertura = LocalTime.of(7, 0);  cierre = LocalTime.of(13, 0); nombreHorario = "mañana (07:00–13:00)"; }
            case TARDE  -> { apertura = LocalTime.of(13, 0); cierre = LocalTime.of(18, 0); nombreHorario = "tarde (13:00–18:00)"; }
            case NOCHE  -> { apertura = LocalTime.of(18, 0); cierre = LocalTime.of(22, 0); nombreHorario = "noche (18:00–22:00)"; }
            default     -> throw new RuntimeException("Horario de comisión no reconocido.");
        }

        if (inicio.isBefore(apertura) || fin.isAfter(cierre)) {
            throw new RuntimeException(
                "El horario de la comisión es " + nombreHorario +
                ". La reserva debe estar dentro de ese rango.");
        }
    }
}