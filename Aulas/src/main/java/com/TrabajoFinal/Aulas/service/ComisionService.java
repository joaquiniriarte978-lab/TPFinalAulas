package com.TrabajoFinal.Aulas.service;

import com.TrabajoFinal.Aulas.Dtos.comisionDTO.ComisionResponseDTO;
import com.TrabajoFinal.Aulas.Repository.MateriaRepository;
import com.TrabajoFinal.Aulas.Repository.ComisionRepository;
import com.TrabajoFinal.Aulas.Repository.ProfesorRepository;
import com.TrabajoFinal.Aulas.Repository.UsuarioRepository;
import com.TrabajoFinal.Aulas.exceptions.ResourceNotFoundException;
import com.TrabajoFinal.Aulas.model.Comision;
import com.TrabajoFinal.Aulas.model.Materia;
import com.TrabajoFinal.Aulas.model.Profesor;
import com.TrabajoFinal.Aulas.model.Usuario;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ComisionService {

    private final ComisionRepository comisionRepository;
    private final UsuarioRepository usuarioRepository;
    private final MateriaRepository materiaRepository;
    private final ProfesorRepository profesorRepository;

    public List<Comision> listar(){
        return comisionRepository.findAll();
    }

    public Comision listarPorId(Integer id){
        return comisionRepository.findById(id).orElseThrow(()-> new ResourceNotFoundException("Comision", id));
    }

    public Comision guardar(ComisionResponseDTO dto){
        Comision comision = new Comision();
        Profesor profesor = profesorRepository.findByUsuarioId(dto.getId_profesor())
                .orElseThrow(() -> new RuntimeException("Profesor no encontrado"));
        Materia materia=materiaRepository.findById(dto.getId_materia()).orElseThrow(()-> new ResourceNotFoundException("materia", dto.getId_materia()));
        comision.setProfesor(profesor);
        comision.setMateria(materia);
        comision.setCantAlumnos(dto.getCantAlumnos());
        return comisionRepository.save(comision);
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

    public Comision actualizar(Integer id, ComisionResponseDTO dto){
        Comision com = comisionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Comision", id));
        Profesor profesor=profesorRepository.findByUsuarioId(dto.getId_profesor())
                .orElseThrow(()-> new ResourceNotFoundException("Profesor", dto.getId_profesor()));
        Materia materia=materiaRepository.findById(dto.getId_materia()).orElseThrow(()-> new ResourceNotFoundException("Materia", dto.getId_materia()));
        com.setMateria(materia);
        com.setProfesor(profesor);
        com.setCantAlumnos(dto.getCantAlumnos());
        return comisionRepository.save(com);
    }
}