package com.TrabajoFinal.Aulas.service;

import com.TrabajoFinal.Aulas.Dtos.profesorDTO.ProfesorResponseDTO;
import com.TrabajoFinal.Aulas.Repository.*;
import com.TrabajoFinal.Aulas.exceptions.ResourceNotFoundException;
import com.TrabajoFinal.Aulas.model.*;
import com.TrabajoFinal.Aulas.model.enums.Rol;

import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
@RequiredArgsConstructor
public class ProfesorService {
    private final ProfesorRepository profesores;
    private final MateriaRepository materias;
    private final ComisionRepository comisiones;
    private final AgendaRules agenda;

    @Transactional(readOnly = true)
    public List<ProfesorResponseDTO> listar(Integer materiaId) {
        return profesores.findAll().stream()
                .filter(p -> p.getUsuario().getRol() == Rol.PROFESOR)
                .filter(
                        p ->
                                materiaId == null
                                        || p.getMaterias().stream()
                                                .anyMatch(m -> m.getId().equals(materiaId)))
                .map(this::dto)
                .toList();
    }

    public ProfesorResponseDTO dto(Profesor p) {
        return new ProfesorResponseDTO(
                p.getId(),
                p.getUsuario().getId(),
                p.getUsuario().getNombre(),
                p.getUsuario().getEmail(),
                p.getMaterias().stream().map(Materia::getId).toList());
    }

    @Transactional
    public ProfesorResponseDTO asignar(Integer id, List<Integer> ids) {
        agenda.bloquear();
        Profesor p =
                profesores
                        .findById(id)
                        .orElseThrow(() -> new ResourceNotFoundException("Profesor", id));
        if (p.getUsuario().getRol() != Rol.PROFESOR)
            throw new IllegalArgumentException("La cuenta ya no tiene rol profesor.");
        if (ids == null || ids.stream().anyMatch(Objects::isNull))
            throw new IllegalArgumentException("Seleccioná materias válidas.");
        var nuevas = materias.findAllById(ids.stream().distinct().toList());
        if (nuevas.size() != ids.stream().distinct().count())
            throw new IllegalArgumentException("Alguna materia no existe.");
        for (Comision c :
                comisiones.findByProfesorIdAndFechaFinGreaterThanEqual(id, agenda.hoy())) {
            if (!ids.contains(c.getMateria().getId()))
                throw new IllegalArgumentException(
                        "No se puede quitar una materia con comisiones vigentes.");
        }
        p.setMaterias(new ArrayList<>(nuevas));
        return dto(profesores.save(p));
    }
}
