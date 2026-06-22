package com.TrabajoFinal.Aulas.service;

import com.TrabajoFinal.Aulas.Dtos.comisionDTO.ClaseFijaDTO;
import com.TrabajoFinal.Aulas.Repository.AulaRepository;
import com.TrabajoFinal.Aulas.Repository.ClaseFijaRepository;
import com.TrabajoFinal.Aulas.Repository.ComisionRepository;
import com.TrabajoFinal.Aulas.exceptions.ResourceNotFoundException;
import com.TrabajoFinal.Aulas.model.Aula;
import com.TrabajoFinal.Aulas.model.ClaseFija;
import com.TrabajoFinal.Aulas.model.Comision;
import com.TrabajoFinal.Aulas.model.enums.Horario;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalTime;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ClaseFijaService {

    private final ClaseFijaRepository claseFijaRepository;
    private final ComisionRepository  comisionRepository;
    private final AulaRepository      aulaRepository;

    public ClaseFija crearOActualizar(ClaseFijaDTO dto) {
        ClaseFija cf = claseFijaRepository.findByComisionId(dto.getId_comision())
                .orElse(new ClaseFija());

        Comision comision = comisionRepository.findById(dto.getId_comision())
                .orElseThrow(() -> new ResourceNotFoundException("Comision", dto.getId_comision()));
        Aula aula = aulaRepository.findById(dto.getId_aula())
                .orElseThrow(() -> new ResourceNotFoundException("Aula", dto.getId_aula()));

        validarHorarioTurno(dto.getHoraInicio(), dto.getHoraFin(), comision.getHorario());

        boolean hayConflicto = claseFijaRepository.existeConflicto(
                dto.getId_aula(),
                dto.getDiaSemana(),
                dto.getHoraInicio(),
                dto.getHoraFin()
        );

        if (hayConflicto) {
            if (cf.getId() == null) {
                throw new RuntimeException(
                        "El aula '" + aula.getNombre() + "' ya tiene una clase fija los " +
                                dto.getDiaSemana().name().toLowerCase() +
                                " en ese horario."
                );
            } else {
                boolean esConsigoMisma =
                        cf.getAula().getId().equals(dto.getId_aula()) &&
                                cf.getDiaSemana() == dto.getDiaSemana() &&
                                cf.getHoraInicio().equals(dto.getHoraInicio()) &&
                                cf.getHoraFin().equals(dto.getHoraFin());

                if (!esConsigoMisma) {
                    throw new RuntimeException(
                            "El aula '" + aula.getNombre() + "' ya tiene una clase fija los " +
                                    dto.getDiaSemana().name().toLowerCase() +
                                    " en ese horario."
                    );
                }
            }
        }



        cf.setComision(comision);
        cf.setAula(aula);
        cf.setDiaSemana(dto.getDiaSemana());
        cf.setHoraInicio(dto.getHoraInicio());
        cf.setHoraFin(dto.getHoraFin());

        return claseFijaRepository.save(cf);
    }

    private void validarHorarioTurno(LocalTime horaInicio, LocalTime horaFin, Horario turno) {
        LocalTime inicioTurno;
        LocalTime finTurno;

        switch (turno) {
            case MAÑANA -> { inicioTurno = LocalTime.of(6,  0); finTurno = LocalTime.of(13, 0); }
            case TARDE  -> { inicioTurno = LocalTime.of(13, 0); finTurno = LocalTime.of(19, 0); }
            case NOCHE  -> { inicioTurno = LocalTime.of(19, 0); finTurno = LocalTime.of(23, 59); }
            default     -> throw new RuntimeException("Turno desconocido: " + turno);
        }

        if (horaInicio.isBefore(inicioTurno) || horaInicio.isAfter(finTurno)) {
            throw new RuntimeException(
                "El horario de inicio (" + horaInicio + ") no corresponde al turno " + turno +
                ". Rango permitido: " + inicioTurno + " - " + finTurno + "."
            );
        }
        if (horaFin.isBefore(horaInicio) || horaFin.isAfter(finTurno)) {
            throw new RuntimeException(
                "El horario de fin (" + horaFin + ") no corresponde al turno " + turno +
                ". Rango permitido: " + inicioTurno + " - " + finTurno + "."
            );
        }
    }

    public Optional<ClaseFija> buscarPorComision(Integer idComision) {
        return claseFijaRepository.findByComisionId(idComision);
    }

    public void eliminarPorComision(Integer idComision) {
        claseFijaRepository.findByComisionId(idComision)
                .ifPresent(claseFijaRepository::delete);
    }
}