package com.TrabajoFinal.Aulas.Controller;

import com.TrabajoFinal.Aulas.Dtos.comisionDTO.ComisionResponseDTO;
import com.TrabajoFinal.Aulas.model.Comision;
import com.TrabajoFinal.Aulas.service.ComisionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping ("/api/comision")
public class ComisionController {
    private final ComisionService service;

    @GetMapping
    public List<Comision> listarTodos() {
        return service.listar();
    }

    @GetMapping("/{id}")
    public Comision listarPorId(@PathVariable Integer id) {
        return service.listarPorId(id);
    }

    @PostMapping
    public Comision guardar(@Valid @RequestBody ComisionResponseDTO profesorMateria) {
        return service.guardar(profesorMateria);
    }

    @PutMapping("/{id}")
    public Comision modificar(@PathVariable Integer id, @Valid @RequestBody ComisionResponseDTO profesorMateria) {
        return service.actualizar(id, profesorMateria);
    }

    @DeleteMapping("/{id}")
    public void eliminar(@PathVariable Integer id) {
        service.borrar(id);
    }
}