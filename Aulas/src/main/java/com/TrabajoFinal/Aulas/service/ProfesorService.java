package com.TrabajoFinal.Aulas.service;

import com.TrabajoFinal.Aulas.model.Materia;
import com.TrabajoFinal.Aulas.model.Profesor;
import com.TrabajoFinal.Aulas.Repository.MateriaRepository;
import com.TrabajoFinal.Aulas.Repository.ProfesorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProfesorService {

    private final ProfesorRepository profesorRepository;
    private final MateriaRepository materiaRepository;


    public Profesor asignarMateria(Integer idProfesor, Integer idMateria){

        Profesor profesor = profesorRepository.findById(idProfesor)
                .orElseThrow(() -> new RuntimeException("Profesor no encontrado"));

        Materia materia = materiaRepository.findById(idMateria)
                .orElseThrow(() -> new RuntimeException("Materia no encontrada"));


        profesor.getMaterias().add(materia);

        return profesorRepository.save(profesor);
    }

    public List<Profesor> buscarPorMateria(Integer idMateria){
        return profesorRepository.findByMateriasId(idMateria);

    }
}