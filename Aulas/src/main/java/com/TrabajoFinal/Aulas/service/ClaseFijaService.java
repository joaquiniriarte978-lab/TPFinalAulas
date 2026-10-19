package com.TrabajoFinal.Aulas.service;

import com.TrabajoFinal.Aulas.Dtos.comisionDTO.ClaseFijaDTO;
import com.TrabajoFinal.Aulas.Repository.*;
import com.TrabajoFinal.Aulas.exceptions.ResourceNotFoundException;
import com.TrabajoFinal.Aulas.model.*;

import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
@RequiredArgsConstructor
public class ClaseFijaService {
    private final ClaseFijaRepository clases;
    private final ComisionRepository comisiones;
    private final AulaRepository aulas;
    private final ClaseFijaLiberadaRepository liberaciones;
    private final AgendaRules agenda;

    public Optional<ClaseFija> buscarPorComision(Integer id) {
        return clases.findByComisionId(id);
    }

    @Transactional
    public ClaseFija crearOActualizar(ClaseFijaDTO dto) {
        agenda.bloquear();
        var c =
                comisiones
                        .findById(dto.getId_comision())
                        .orElseThrow(
                                () ->
                                        new ResourceNotFoundException(
                                                "Comisión", dto.getId_comision()));
        var a =
                aulas.findById(dto.getId_aula())
                        .orElseThrow(() -> new ResourceNotFoundException("Aula", dto.getId_aula()));
        var cf = clases.findByComisionId(c.getId()).orElse(new ClaseFija());
        if (cf.getId() != null
                && (!cf.getAula().getId().equals(a.getId())
                        || cf.getDiaSemana() != dto.getDiaSemana()
                        || !cf.getHoraInicio().equals(dto.getHoraInicio())
                        || !cf.getHoraFin().equals(dto.getHoraFin()))) protegerLiberaciones(cf);
        cf.setComision(c);
        cf.setAula(a);
        cf.setDiaSemana(dto.getDiaSemana());
        cf.setHoraInicio(dto.getHoraInicio());
        cf.setHoraFin(dto.getHoraFin());
        agenda.validarSemanal(cf);
        return clases.save(cf);
    }

    private void protegerLiberaciones(ClaseFija cf) {
        if (liberaciones.findByClaseFijaId(cf.getId()).stream()
                .anyMatch(l -> !l.getFecha().isBefore(agenda.hoy())))
            throw new IllegalArgumentException(
                    "Hay cambios de aula pendientes. Cancelá esas reservas antes de cambiar la"
                        + " clase fija.");
    }

    @Transactional
    public void eliminarPorComision(Integer id) {
        agenda.bloquear();
        clases.findByComisionId(id)
                .ifPresent(
                        cf -> {
                            protegerLiberaciones(cf);
                            liberaciones.deleteAll(liberaciones.findByClaseFijaId(cf.getId()));
                            liberaciones.flush();
                            clases.delete(cf);
                        });
    }
}
