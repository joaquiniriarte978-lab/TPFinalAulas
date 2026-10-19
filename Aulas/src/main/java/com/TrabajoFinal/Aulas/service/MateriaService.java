package com.TrabajoFinal.Aulas.service;

import com.TrabajoFinal.Aulas.Repository.MateriaRepository;
import com.TrabajoFinal.Aulas.Repository.ProfesorRepository;
import com.TrabajoFinal.Aulas.Repository.ComisionRepository;
import com.TrabajoFinal.Aulas.exceptions.ResourceNotFoundException;
import com.TrabajoFinal.Aulas.model.Materia;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MateriaService{

    private final MateriaRepository materiaRepository;
    private final ProfesorRepository profesorRepository;
    private final ComisionRepository comisionRepository;

    public List<Materia> listar() {
        return materiaRepository.findAll();
    }

    public Materia listarPorId(Integer id) {
        return materiaRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Materia", id));
    }

    public Materia guardar(Materia materia) {
        return materiaRepository.save(materia);
    }

    @Transactional
    public void borrar(Integer id){
        Materia materia = listarPorId(id);
        if (profesorRepository.existsByMateriasId(id) || comisionRepository.existsByMateriaId(id)) {
            throw new IllegalArgumentException("No se puede eliminar la materia porque tiene profesores o comisiones vinculados.");
        }
        materiaRepository.delete(materia);
    }

    public Materia actualizar(Integer id, Materia materia) {
        Materia m = listarPorId(id);
        m.setNombre(materia.getNombre());
        m.setRequiereLaboratorio(materia.isRequiereLaboratorio());
        return materiaRepository.save(m);
    }

    public List<Materia> listarMateriasLaboratorios (){
        return materiaRepository.findMateriaByrequiereLaboratorio(true);
    }


}
