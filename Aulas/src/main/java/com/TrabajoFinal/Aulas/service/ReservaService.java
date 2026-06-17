package com.TrabajoFinal.Aulas.service;

import com.TrabajoFinal.Aulas.Dtos.reservaDTO.ReservaResponseDTO;
import com.TrabajoFinal.Aulas.Repository.*;
import com.TrabajoFinal.Aulas.exceptions.ResourceNotFoundException;
import com.TrabajoFinal.Aulas.model.*;
import com.TrabajoFinal.Aulas.model.enums.EstadoReserva;
import com.TrabajoFinal.Aulas.model.enums.Tipo;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ReservaService {
    private final ReservaRepository reservaRepository;
    private final ComisionRepository comisionRepository;
    private final AulaRepository aulaRepository;

    public Reserva hacerReserva(ReservaResponseDTO dto){
        Comision comision = comisionRepository.findById(dto.getId_comision())
                .orElseThrow(() -> new ResourceNotFoundException("Comision", dto.getId_comision()));
        Aula aula = aulaRepository.findById(dto.getId_aula())
                .orElseThrow(() -> new ResourceNotFoundException("Aula", dto.getId_aula()));


        if (!dto.getHoraFin().isAfter(dto.getHoraInicio())) {
            throw new RuntimeException("La hora de fin debe ser posterior a la hora de inicio.");
        }else if (dto.getFecha().isBefore(LocalDate.now())){
            throw new RuntimeException("La fecha de la reserva debe ser posterior a la fecha actual");
        }else if (dto.getFecha().isEqual(LocalDate.now()) && dto.getHoraInicio().isBefore(LocalTime.now())){
            throw new RuntimeException("La hora de inicio de la reserva debe ser posterior a la hora actual");
        }

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

        if (reservaRepository.existeConflicto(
                dto.getId_aula(), dto.getFecha(), dto.getHoraInicio(), dto.getHoraFin())) {
            throw new RuntimeException(
                    "El aula ya tiene una reserva activa en ese horario.");
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
    public Reserva modificarReserva(Integer id, ReservaResponseDTO reservaNueva){
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

    public void eliminarReserva(Integer id){
        reservaRepository.deleteById(id);
    }

    public List<Reserva> listarPorMateria(Integer idMateria) {
        return reservaRepository.findReservasByMateria(idMateria);
    }

}
