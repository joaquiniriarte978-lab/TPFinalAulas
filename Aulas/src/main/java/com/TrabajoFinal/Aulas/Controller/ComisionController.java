package com.TrabajoFinal.Aulas.Controller;

import com.TrabajoFinal.Aulas.Dtos.comisionDTO.ComisionResponseDTO;
import com.TrabajoFinal.Aulas.model.Comision;
import com.TrabajoFinal.Aulas.service.ComisionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping ("/api/comision")
public class ComisionController {
    private final ComisionService service;

    @GetMapping("/mis-comisiones")
    public List<ComisionResponseDTO> misComisiones(Authentication authentication) {
        return service.listarPorProfesorEmail(authentication.getName()).stream()
                .map(comision -> {
                    ComisionResponseDTO dto = new ComisionResponseDTO();
                    dto.setId(comision.getId());
                    dto.setId_profesor(comision.getProfesor().getId());
                    dto.setId_materia(comision.getMateria().getId());
                    dto.setCantAlumnos(comision.getCantAlumnos());
                    dto.setMateriaNombre(comision.getMateria().getNombre());
                    dto.setProfesorNombre(comision.getProfesor().getUsuario().getNombre());
                    return dto;
                })
                .toList();
    }

    @GetMapping
    public List<ComisionResponseDTO> listarTodos() {
        return service.listar().stream()
                .map(comision -> {
                    ComisionResponseDTO dto = new ComisionResponseDTO();
                    dto.setId(comision.getId());
                    dto.setId_profesor(comision.getProfesor().getId());
                    dto.setId_materia(comision.getMateria().getId());
                    dto.setCantAlumnos(comision.getCantAlumnos());
                    dto.setMateriaNombre(comision.getMateria().getNombre());
                    dto.setProfesorNombre(comision.getProfesor().getUsuario().getNombre());
                    return dto;
                })
                .toList();
    }

    @GetMapping("/{id}")
    public ComisionResponseDTO listarPorId(@PathVariable Integer id) {
        Comision comision = service.listarPorId(id);
        ComisionResponseDTO dto = new ComisionResponseDTO();
        dto.setId(comision.getId());
        dto.setId_profesor(comision.getProfesor().getId());
        dto.setId_materia(comision.getMateria().getId());
        dto.setCantAlumnos(comision.getCantAlumnos());
        dto.setMateriaNombre(comision.getMateria().getNombre());
        dto.setProfesorNombre(comision.getProfesor().getUsuario().getNombre());
        return dto;
    }

    @PostMapping
    public ComisionResponseDTO guardar(@Valid @RequestBody ComisionResponseDTO profesorMateria) {
        Comision saved = service.guardar(profesorMateria);
        ComisionResponseDTO dto = new ComisionResponseDTO();
        dto.setId(saved.getId());
        dto.setId_profesor(saved.getProfesor().getId());
        dto.setId_materia(saved.getMateria().getId());
        dto.setCantAlumnos(saved.getCantAlumnos());
        dto.setMateriaNombre(saved.getMateria().getNombre());
        dto.setProfesorNombre(saved.getProfesor().getUsuario().getNombre());
        return dto;
    }

    @PutMapping("/{id}")
    public ComisionResponseDTO modificar(@PathVariable Integer id, @Valid @RequestBody ComisionResponseDTO profesorMateria) {
        Comision updated = service.actualizar(id, profesorMateria);
        ComisionResponseDTO dto = new ComisionResponseDTO();
        dto.setId(updated.getId());
        dto.setId_profesor(updated.getProfesor().getId());
        dto.setId_materia(updated.getMateria().getId());
        dto.setCantAlumnos(updated.getCantAlumnos());
        dto.setMateriaNombre(updated.getMateria().getNombre());
        dto.setProfesorNombre(updated.getProfesor().getUsuario().getNombre());
        return dto;
    }

    @DeleteMapping("/{id}")
    public void eliminar(@PathVariable Integer id) {
        service.borrar(id);
    }
}