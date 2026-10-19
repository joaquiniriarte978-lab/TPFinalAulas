package com.TrabajoFinal.Aulas.Controller;

import com.TrabajoFinal.Aulas.Dtos.profesorDTO.ProfesorResponseDTO;
import com.TrabajoFinal.Aulas.service.ProfesorService;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;

import lombok.RequiredArgsConstructor;

import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/profesores")
public class ProfesorController {
    private final ProfesorService service;

    public record MateriasInput(@NotNull List<@NotNull Integer> materiasIds) {}

    @GetMapping
    public List<ProfesorResponseDTO> listar() {
        return service.listar(null);
    }

    @GetMapping("/materia/{id}")
    public List<ProfesorResponseDTO> porMateria(@PathVariable Integer id) {
        return service.listar(id);
    }

    @PutMapping("/{id}/materias")
    public ProfesorResponseDTO asignar(
            @PathVariable Integer id, @Valid @RequestBody MateriasInput body) {
        return service.asignar(id, body.materiasIds());
    }
}
