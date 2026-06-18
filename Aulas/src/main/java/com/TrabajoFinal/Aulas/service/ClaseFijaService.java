package com.TrabajoFinal.Aulas.service;

import com.TrabajoFinal.Aulas.Dtos.comisionDTO.ClaseFijaDTO;
import com.TrabajoFinal.Aulas.Repository.AulaRepository;
import com.TrabajoFinal.Aulas.Repository.ClaseFijaRepository;
import com.TrabajoFinal.Aulas.Repository.ComisionRepository;
import com.TrabajoFinal.Aulas.exceptions.ResourceNotFoundException;
import com.TrabajoFinal.Aulas.model.Aula;
import com.TrabajoFinal.Aulas.model.ClaseFija;
import com.TrabajoFinal.Aulas.model.Comision;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ClaseFijaService {

    private final ClaseFijaRepository claseFijaRepository;
    private final ComisionRepository  comisionRepository;
    private final AulaRepository      aulaRepository;

    public ClaseFija crearOActualizar(ClaseFijaDTO dto) {
        ClaseFija cf = claseFijaRepository.findByComisionId(dto.getId_comision())
                .orElse(new ClaseFija());

        Comision comision = comisionRepository.findById(dto.getId_comision())
                .orElseThrow(() -> new ResourceNotFoundException("Comision", dto.getId_comision()));
        Aula aula = aulaRepository.findById(dto.getId_aula())
                .orElseThrow(() -> new ResourceNotFoundException("Aula", dto.getId_aula()));

        cf.setComision(comision);
        cf.setAula(aula);
        cf.setDiaSemana(dto.getDiaSemana());
        cf.setHoraInicio(dto.getHoraInicio());
        cf.setHoraFin(dto.getHoraFin());

        return claseFijaRepository.save(cf);
    }

    public Optional<ClaseFija> buscarPorComision(Integer idComision) {
        return claseFijaRepository.findByComisionId(idComision);
    }

    public void eliminarPorComision(Integer idComision) {
        claseFijaRepository.findByComisionId(idComision)
                .ifPresent(claseFijaRepository::delete);
    }
}