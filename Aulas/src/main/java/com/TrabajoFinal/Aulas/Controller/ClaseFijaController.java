package com.TrabajoFinal.Aulas.Controller;

import com.TrabajoFinal.Aulas.Dtos.comisionDTO.ClaseFijaDTO;
import com.TrabajoFinal.Aulas.model.ClaseFija;
import com.TrabajoFinal.Aulas.service.ClaseFijaService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/clase-fija")
public class ClaseFijaController {

    private final ClaseFijaService claseFijaService;

    @PostMapping
    public ClaseFijaDTO guardar(@RequestBody ClaseFijaDTO dto) {
        ClaseFija cf = claseFijaService.crearOActualizar(dto);
        return toDto(cf);
    }

    @DeleteMapping("/comision/{idComision}")
    public void eliminarPorComision(@PathVariable Integer idComision) {
        claseFijaService.eliminarPorComision(idComision);
    }

    private ClaseFijaDTO toDto(ClaseFija cf) {
        ClaseFijaDTO dto = new ClaseFijaDTO();
        dto.setId(cf.getId());
        dto.setId_comision(cf.getComision().getId());
        dto.setId_aula(cf.getAula().getId());
        dto.setAulaNombre(cf.getAula().getNombre());
        dto.setDiaSemana(cf.getDiaSemana());
        dto.setHoraInicio(cf.getHoraInicio());
        dto.setHoraFin(cf.getHoraFin());
        return dto;
    }
}