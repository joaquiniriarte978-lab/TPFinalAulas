package com.TrabajoFinal.Aulas.service;


import com.TrabajoFinal.Aulas.Repository.ProfesorMateriaRepository;
import com.TrabajoFinal.Aulas.model.Materia;
import com.TrabajoFinal.Aulas.model.ProfesorMateria;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProfesorMateriaService {

    private final ProfesorMateriaRepository profesorMateriaRepository;

    public List<ProfesorMateria> listar(){
        return profesorMateriaRepository.findAll();
    }

    public ProfesorMateria listarPorId(Integer id){
        return profesorMateriaRepository.findById(id).orElseThrow(()-> new RuntimeException("Profesor-Materia no encontrado"));
    }

    public ProfesorMateria guardar(ProfesorMateria profesorMateria){
        return profesorMateriaRepository.save(profesorMateria);
    }

    public void borrar(Integer id){
        profesorMateriaRepository.deleteById(id);
    }

    public ProfesorMateria actualizar(Integer id, ProfesorMateria profesorMateria){
        ProfesorMateria pm = profesorMateriaRepository.findById(id).orElseThrow(() -> new RuntimeException("Profesor-Materia no encontrado"));
        pm.setId_materia(profesorMateria.getId_materia());
        pm.setId_profesor(profesorMateria.getId_profesor());
        return profesorMateriaRepository.save(pm);
    }
}
