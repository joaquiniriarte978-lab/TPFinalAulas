package com.TrabajoFinal.Aulas.service;

import com.TrabajoFinal.Aulas.Dtos.comisionDTO.ComisionResponseDTO;
import com.TrabajoFinal.Aulas.Dtos.comisionDTO.ClaseFijaDTO;
import com.TrabajoFinal.Aulas.Repository.*;
import com.TrabajoFinal.Aulas.exceptions.ResourceNotFoundException;
import com.TrabajoFinal.Aulas.model.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ComisionService {

    private final ComisionRepository comisionRepository;
    private final UsuarioRepository usuarioRepository;
    private final MateriaRepository materiaRepository;
    private final ProfesorRepository profesorRepository;
    private final ClaseFijaRepository claseFijaRepository;
    private final AulaRepository aulaRepository;

    public List<Comision> listar(){
        return comisionRepository.findAll();
    }

    public Comision listarPorId(Integer id){
        return comisionRepository.findById(id).orElseThrow(()-> new ResourceNotFoundException("Comision", id));
    }

    @Transactional
    public Comision guardar(ComisionResponseDTO dto){
        Comision comision = new Comision();
        Profesor profesor = profesorRepository.findByUsuarioId(dto.getId_profesor())
                .orElseThrow(() -> new RuntimeException("Profesor no encontrado"));
        Materia materia=materiaRepository.findById(dto.getId_materia()).orElseThrow(()-> new ResourceNotFoundException("materia", dto.getId_materia()));
        validarFechasCursada(dto.getFechaInicio(), dto.getFechaFin());
        comision.setProfesor(profesor);
        comision.setMateria(materia);
        comision.setCantAlumnos(dto.getCantAlumnos());
        comision.setHorario(dto.getHorario());
        comision.setFechaInicio(dto.getFechaInicio());
        comision.setFechaFin(dto.getFechaFin());
        Comision saved = comisionRepository.save(comision);
        procesarClaseFija(dto.getClaseFija(), saved.getId());
        return saved;
    }

    public List<Comision> listarPorProfesorEmail(String email) {
        return comisionRepository.findByProfesorUsuarioEmail(email);
    }

    public List<Comision> listarPorMateria(Integer idMateria) {
        return comisionRepository.findByMateriaId(idMateria);
    }

    public void borrar(Integer id){
        comisionRepository.deleteById(id);
    }

    @Transactional
    public Comision actualizar(Integer id, ComisionResponseDTO dto){
        Comision com = comisionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Comision", id));
        Profesor profesor=profesorRepository.findByUsuarioId(dto.getId_profesor())
                .orElseThrow(()-> new ResourceNotFoundException("Profesor", dto.getId_profesor()));
        Materia materia=materiaRepository.findById(dto.getId_materia()).orElseThrow(()-> new ResourceNotFoundException("Materia", dto.getId_materia()));
        validarFechasCursada(dto.getFechaInicio(), dto.getFechaFin());
        com.setMateria(materia);
        com.setProfesor(profesor);
        com.setCantAlumnos(dto.getCantAlumnos());
        com.setHorario(dto.getHorario());
        com.setFechaInicio(dto.getFechaInicio());
        com.setFechaFin(dto.getFechaFin());
        Comision updated = comisionRepository.save(com);
        procesarClaseFija(dto.getClaseFija(), updated.getId());
        return updated;
    }

    private void procesarClaseFija(ClaseFijaDTO claseFijaDTO, Integer comisionId) {
        if (claseFijaDTO == null) {
            // No clase fija desired: delete any existing
            claseFijaRepository.findByComisionId(comisionId).ifPresent(claseFijaRepository::delete);
            return;
        }

        // There is a clase fija to save/update
        ClaseFija cf = claseFijaRepository.findByComisionId(comisionId)
                .orElse(new ClaseFija());

        // Set comision (ensures the FK)
        Comision comision = comisionRepository.findById(comisionId)
                .orElseThrow(() -> new ResourceNotFoundException("Comision", comisionId));
        cf.setComision(comision);


        Aula aula = aulaRepository.findById(claseFijaDTO.getId_aula())
                .orElseThrow(() -> new ResourceNotFoundException("Aula", claseFijaDTO.getId_aula()));

        cf.setAula(aula); // Asignar el objeto Aula completo en lugar del ID
        // ---------------------

        cf.setDiaSemana(claseFijaDTO.getDiaSemana());
        cf.setHoraInicio(claseFijaDTO.getHoraInicio());
        cf.setHoraFin(claseFijaDTO.getHoraFin());
        claseFijaRepository.save(cf);
    }

    private void validarFechasCursada(LocalDate inicio, LocalDate fin) {
        if (!fin.isAfter(inicio)) {
            throw new RuntimeException("La fecha de fin debe ser posterior a la fecha de inicio.");
        }
        long meses = ChronoUnit.MONTHS.between(inicio, fin);
        if (meses < 2) {
            throw new RuntimeException("La cursada debe durar al menos 2 meses.");
        }
        if (meses > 6) {
            throw new RuntimeException("La cursada no puede durar más de 6 meses.");
        }
    }
}