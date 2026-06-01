package com.TrabajoFinal.Aulas.service;

import com.TrabajoFinal.Aulas.Repository.MateriaRepository;
import com.TrabajoFinal.Aulas.model.Materia;
import lombok.RequiredArgsConstructor;
import org.hibernate.query.sqm.mutation.internal.inline.MatchingIdRestrictionProducer;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MateriaService {

    private final MateriaRepository materiaRepository;

    public List<Materia> listar() {
        return materiaRepository.findAll();
    }

    public Materia listarPorId(Integer id) {
        return materiaRepository.findById(id).orElseThrow(() -> new RuntimeException("Materia no encontrada"));
    }

    public Materia guardar(Materia materia) {
        return materiaRepository.save(materia);
    }

    public void borrar(Integer id){
        materiaRepository.deleteById(id);
    }

    public Materia actualizar(Integer id, Materia materia) {
        Materia m = materiaRepository.findById(id).orElseThrow(() -> new RuntimeException("Materia no encontrada"));
        m.setNombre(materia.getNombre());
        m.setRequiere_laboratorio(materia.isRequiere_laboratorio());
        return materiaRepository.save(m);
    }

    public List<Materia> listarMateriasLaboratorios (){
        return materiaRepository.findMateriaByrequiere_laboratorio(true);
    }

    public List<Materia> listarMateriasNoLaboratorios(){
        return materiaRepository.findMateriaByrequiere_laboratorio(false);
    }
}
