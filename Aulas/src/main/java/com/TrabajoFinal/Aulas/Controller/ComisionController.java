package com.TrabajoFinal.Aulas.Controller;

import com.TrabajoFinal.Aulas.Dtos.comisionDTO.ClaseFijaDTO;
import com.TrabajoFinal.Aulas.Dtos.comisionDTO.ComisionResponseDTO;
import com.TrabajoFinal.Aulas.model.ClaseFija;
import com.TrabajoFinal.Aulas.model.Comision;
import com.TrabajoFinal.Aulas.service.ClaseFijaService;
import com.TrabajoFinal.Aulas.service.ComisionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/comision")
public class ComisionController {

    private final ComisionService service;
    private final ClaseFijaService claseFijaService;

    @GetMapping("/mis-comisiones")
    public List<ComisionResponseDTO> misComisiones(Authentication authentication) {
        return service.listarPorProfesorEmail(authentication.getName()).stream()
                .map(this::toDto)
                .toList();
    }

    @GetMapping
    public List<ComisionResponseDTO> listarTodos() {
        return service.listar().stream()
                .map(this::toDto)
                .toList();
    }

    @GetMapping("/materia/{id_materia}")
    public List<ComisionResponseDTO> listarPorMateria(@PathVariable Integer id_materia) {
        return service.listarPorMateria(id_materia).stream()
                .map(this::toDto)
                .toList();
    }

    @GetMapping("/{id}")
    public ComisionResponseDTO listarPorId(@PathVariable Integer id) {
        return toDto(service.listarPorId(id));
    }

    @PostMapping
    public ComisionResponseDTO guardar(@Valid @RequestBody ComisionResponseDTO profesorMateria) {
        return toDto(service.guardar(profesorMateria));
    }

    @PutMapping("/{id}")
    public ComisionResponseDTO modificar(@PathVariable Integer id,
                                         @Valid @RequestBody ComisionResponseDTO profesorMateria) {
        return toDto(service.actualizar(id, profesorMateria));
    }

    @DeleteMapping("/{id}")
    public void eliminar(@PathVariable Integer id) {
        service.borrar(id);
    }

    private ComisionResponseDTO toDto(Comision c) {
        ComisionResponseDTO dto = new ComisionResponseDTO();
        dto.setId(c.getId());
        dto.setId_profesor(c.getProfesor().getId());
        dto.setId_materia(c.getMateria().getId());
        dto.setCantAlumnos(c.getCantAlumnos());
        dto.setMateriaNombre(c.getMateria().getNombre());
        dto.setProfesorNombre(c.getProfesor().getUsuario().getNombre());
        dto.setHorario(c.getHorario());
        dto.setFechaInicio(c.getFechaInicio());
        dto.setFechaFin(c.getFechaFin());
        claseFijaService.buscarPorComision(c.getId()).ifPresent(cf -> dto.setClaseFija(cfToDto(cf)));
        return dto;
    }

    private ClaseFijaDTO cfToDto(ClaseFija cf) {
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