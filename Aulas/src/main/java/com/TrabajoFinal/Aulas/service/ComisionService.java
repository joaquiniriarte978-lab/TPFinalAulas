package com.TrabajoFinal.Aulas.service;


import com.TrabajoFinal.Aulas.Dtos.comisionDTO.ComisionResponseDTO;
import com.TrabajoFinal.Aulas.Repository.MateriaRepository;
import com.TrabajoFinal.Aulas.Repository.ComisionRepository;
import com.TrabajoFinal.Aulas.Repository.UsuarioRepository;
import com.TrabajoFinal.Aulas.model.Comision;
import com.TrabajoFinal.Aulas.model.Materia;
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

    public List<Comision> listar(){
        return comisionRepository.findAll();
    }

    public Comision listarPorId(Integer id){
        return comisionRepository.findById(id).orElseThrow(()-> new RuntimeException("Profesor-Materia no encontrado"));
    }

    public Comision guardar(ComisionResponseDTO dto){
        Comision comision = new Comision();
        Usuario profesor=usuarioRepository.findById(dto.getId_profesor())
                .orElseThrow(()-> new RuntimeException("Usuario no encontrado"));
        Materia materia=materiaRepository.findById(dto.getId_materia()).orElseThrow(()-> new RuntimeException("Materia no encontrada"));
        comision.setProfesor(profesor);
        comision.setMateria(materia);
        comision.setCantAlumnos(dto.getCantAlumnos());
        return comisionRepository.save(comision);
    }

    public void borrar(Integer id){
        comisionRepository.deleteById(id);
    }

    public Comision actualizar(Integer id, ComisionResponseDTO dto){
        Comision com = comisionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Profesor o Materia no encontrado"));
        Usuario profesor=usuarioRepository.findById(dto.getId_profesor())
                .orElseThrow(()-> new RuntimeException("Usuario no encontrado"));
        Materia materia=materiaRepository.findById(dto.getId_materia()).orElseThrow(()-> new RuntimeException("Materia no encontrada"));
        com.setMateria(materia);
        com.setProfesor(profesor);
        com.setCantAlumnos(dto.getCantAlumnos());
        return comisionRepository.save(com);
    }
}
