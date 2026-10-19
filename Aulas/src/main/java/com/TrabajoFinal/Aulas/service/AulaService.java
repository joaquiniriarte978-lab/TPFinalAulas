package com.TrabajoFinal.Aulas.service;

import com.TrabajoFinal.Aulas.Repository.AulaRepository;
import com.TrabajoFinal.Aulas.Repository.AvisoRepository;
import com.TrabajoFinal.Aulas.Repository.ReservaRepository;
import com.TrabajoFinal.Aulas.Repository.ClaseFijaRepository;
import com.TrabajoFinal.Aulas.exceptions.ResourceNotFoundException;
import com.TrabajoFinal.Aulas.model.Aula;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AulaService {
    private final AulaRepository aulaRepository;
    private final ReservaRepository reservaRepository;
    private final AvisoRepository avisoRepository;
    private final ClaseFijaRepository claseFijaRepository;

    public List<Aula> listarAulas(){
        return aulaRepository.findAll();
    }

    public Aula aulaXid(Integer id) {
        return aulaRepository.findById(id)
                .orElseThrow(()-> new ResourceNotFoundException("Aula", id));
    }

    public Aula guardarAula(Aula aula){
        return aulaRepository.save(aula);
    }

    @Transactional
    public void borrarAula(Integer id)  {
        Aula borrada = aulaXid(id);
        if (claseFijaRepository.existsByAulaId(id)) {
            throw new IllegalArgumentException("No se puede eliminar el aula porque tiene clases fijas asignadas.");
        }
        if (reservaRepository.existsByAulaId(id)) {
            throw new RuntimeException("No se puede eliminar el aula porque tiene reservas asignadas.");
        }
        if (avisoRepository.existsByAulaId(id)) {
            throw new RuntimeException("No se puede eliminar el aula porque tiene avisos pendientes.");
        }
        aulaRepository.delete(borrada);
    }

    public Aula modificarAula(Integer id, Aula nueva) {
        Aula modificada = aulaXid(id);
        modificada.setCapacidad(nueva.getCapacidad());
        modificada.setTipo(nueva.getTipo());
        modificada.setEquipamiento(nueva.getEquipamiento());
        modificada.setNombre(nueva.getNombre());
        return aulaRepository.save(modificada);
    }
}
