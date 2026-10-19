package com.TrabajoFinal.Aulas.service;

import com.TrabajoFinal.Aulas.Dtos.comisionDTO.ComisionRequestDTO;
import com.TrabajoFinal.Aulas.Repository.*;
import com.TrabajoFinal.Aulas.exceptions.ResourceNotFoundException;
import com.TrabajoFinal.Aulas.model.*;
import com.TrabajoFinal.Aulas.model.enums.Rol;

import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ComisionService {
    private final ComisionRepository comisiones;
    private final MateriaRepository materias;
    private final ProfesorRepository profesores;
    private final ClaseFijaRepository clases;
    private final ReservaRepository reservas;
    private final AgendaRules agenda;

    public List<Comision> listar() {
        return comisiones.findAll();
    }

    public Comision listarPorId(Integer id) {
        return comisiones
                .findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Comisión", id));
    }

    public List<Comision> listarPorProfesorEmail(String email) {
        return comisiones.findByProfesorUsuarioEmail(email);
    }

    public List<Comision> listarPorMateria(Integer id) {
        return comisiones.findByMateriaId(id);
    }

    @Transactional
    public Comision guardar(ComisionRequestDTO dto) {
        agenda.bloquear();
        return guardarDatos(new Comision(), dto);
    }

    @Transactional
    public Comision actualizar(Integer id, ComisionRequestDTO dto) {
        agenda.bloquear();
        return guardarDatos(listarPorId(id), dto);
    }

    private Comision guardarDatos(Comision c, ComisionRequestDTO dto) {
        var profesor =
                profesores
                        .findById(dto.getId_profesor())
                        .orElseThrow(
                                () ->
                                        new ResourceNotFoundException(
                                                "Profesor", dto.getId_profesor()));
        var materia =
                materias.findById(dto.getId_materia())
                        .orElseThrow(
                                () ->
                                        new ResourceNotFoundException(
                                                "Materia", dto.getId_materia()));
        if (profesor.getUsuario().getRol() != Rol.PROFESOR
                || profesor.getMaterias().stream()
                        .noneMatch(m -> m.getId().equals(materia.getId())))
            throw new IllegalArgumentException("El profesor debe tener asignada esa materia.");
        if (dto.getFechaFin().isBefore(dto.getFechaInicio().plusMonths(2))
                || dto.getFechaFin().isAfter(dto.getFechaInicio().plusMonths(6)))
            throw new IllegalArgumentException("La cursada debe durar entre 2 y 6 meses.");
        var futuras =
                c.getId() == null
                        ? List.<Reserva>of()
                        : reservas.findByComisionId(c.getId()).stream()
                                .filter(r -> !agenda.termino(r))
                                .toList();
        if (!futuras.isEmpty()
                && (!c.getProfesor().getId().equals(profesor.getId())
                        || !c.getMateria().getId().equals(materia.getId())))
            throw new IllegalArgumentException(
                    "No se puede cambiar profesor o materia mientras haya reservas futuras.");
        c.setProfesor(profesor);
        c.setMateria(materia);
        c.setCantAlumnos(dto.getCantAlumnos());
        c.setHorario(dto.getHorario());
        c.setFechaInicio(dto.getFechaInicio());
        c.setFechaFin(dto.getFechaFin());
        for (Reserva r : futuras) {
            if (!agenda.vigente(c, r.getFecha()))
                throw new IllegalArgumentException(
                        "Las fechas dejarían una reserva fuera de la cursada.");
            agenda.validar(c, r.getAula(), r.getHoraInicio(), r.getHoraFin());
        }
        if (c.getId() != null) clases.findByComisionId(c.getId()).ifPresent(agenda::validarSemanal);
        return comisiones.save(c);
    }

    @Transactional
    public void borrar(Integer id) {
        agenda.bloquear();
        var c = listarPorId(id);
        if (reservas.existsByComisionId(id) || clases.findByComisionId(id).isPresent())
            throw new IllegalArgumentException(
                    "La comisión tiene clases fijas o reservas vinculadas.");
        comisiones.delete(c);
    }
}
