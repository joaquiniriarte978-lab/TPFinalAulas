package com.TrabajoFinal.Aulas.service;

import com.TrabajoFinal.Aulas.Repository.AulaRepository;
import com.TrabajoFinal.Aulas.model.Aula;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AulaService {
    private final AulaRepository aulaRepository;

    public List<Aula> listarAulas(){
        return aulaRepository.findAll();
    }

    public Aula aulaXid(Integer id) throws Throwable {
        return aulaRepository.findById(id)
                .orElseThrow(()-> new RuntimeException());
    }

    public Aula guardarAula(Aula aula){
        return aulaRepository.save(aula);
    }

    public void borrarAula(Integer id) throws Throwable {
        Aula borrada = aulaXid(id);
         aulaRepository.delete(borrada);
    }

    public Aula modificarAula(Integer id, Aula nueva) throws Throwable {
        Aula modificada = aulaXid(id);
        modificada.setCapacidad(nueva.getCapacidad());
        modificada.setTipo(nueva.getTipo());
        modificada.setEquipamiento(nueva.getEquipamiento());
        modificada.setNombre(nueva.getNombre());
        return aulaRepository.save(modificada);
    }
}
