package com.TrabajoFinal.Aulas.service;


import com.TrabajoFinal.Aulas.Dtos.profesorMateriaDTO.ProfesorMateriaResponseDTO;
import com.TrabajoFinal.Aulas.Repository.MateriaRepository;
import com.TrabajoFinal.Aulas.Repository.ProfesorMateriaRepository;
import com.TrabajoFinal.Aulas.Repository.UsuarioRepository;
import com.TrabajoFinal.Aulas.model.Materia;
import com.TrabajoFinal.Aulas.model.ProfesorMateria;
import com.TrabajoFinal.Aulas.model.Usuario;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProfesorMateriaService {

    private final ProfesorMateriaRepository profesorMateriaRepository;
    private final UsuarioRepository usuarioRepository;
    private final MateriaRepository materiaRepository;

    public List<ProfesorMateria> listar(){
        return profesorMateriaRepository.findAll();
    }

    public ProfesorMateria listarPorId(Integer id){
        return profesorMateriaRepository.findById(id).orElseThrow(()-> new RuntimeException("Profesor-Materia no encontrado"));
    }

    public ProfesorMateria guardar(ProfesorMateriaResponseDTO dto){
        ProfesorMateria profesorMateria = new ProfesorMateria();
        Usuario profesor=usuarioRepository.findById(dto.getId_profesor())
                .orElseThrow(()-> new RuntimeException("Usuario no encontrado"));
        Materia materia=materiaRepository.findById(dto.getId_materia()).orElseThrow(()-> new RuntimeException("Materia no encontrada"));
        profesorMateria.setProfesor(profesor);
        profesorMateria.setMateria(materia);
        return profesorMateriaRepository.save(profesorMateria);
    }

    public void borrar(Integer id){
        profesorMateriaRepository.deleteById(id);
    }

    public ProfesorMateria actualizar(Integer id, ProfesorMateriaResponseDTO dto){
        ProfesorMateria pm = profesorMateriaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Profesor o Materia no encontrado"));
        Usuario profesor=usuarioRepository.findById(dto.getId_profesor())
                .orElseThrow(()-> new RuntimeException("Usuario no encontrado"));
        Materia materia=materiaRepository.findById(dto.getId_materia()).orElseThrow(()-> new RuntimeException("Materia no encontrada"));
        pm.setMateria(materia);
        pm.setProfesor(profesor);
        return profesorMateriaRepository.save(pm);
    }
}
