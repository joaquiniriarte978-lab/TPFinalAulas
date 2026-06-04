package com.TrabajoFinal.Aulas.Controller;

import com.TrabajoFinal.Aulas.Dtos.profesorMateriaDTO.ProfesorMateriaResponseDTO;
import com.TrabajoFinal.Aulas.Repository.ProfesorMateriaRepository;
import com.TrabajoFinal.Aulas.model.ProfesorMateria;
import com.TrabajoFinal.Aulas.service.ProfesorMateriaService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping ("/api/profesorMateria")
public class ProfesorMateriaController {
    private final ProfesorMateriaService service;
    @GetMapping
    public List<ProfesorMateria> listarTodos() {
        return service.listar();
    }
    @GetMapping("/{id}")
    public ProfesorMateria listarPorId(@PathVariable Integer id) {
        return service.listarPorId(id);
    }
    @PostMapping
    public ProfesorMateria guardar(@RequestBody ProfesorMateriaResponseDTO profesorMateria) {
        return service.guardar(profesorMateria);
    }
    @PutMapping("/{id}")
    public ProfesorMateria modificar(@PathVariable Integer id, @RequestBody ProfesorMateriaResponseDTO profesorMateria) {
        return service.actualizar(id, profesorMateria);
    }
    @DeleteMapping("/{id}")
    public void eliminar(@PathVariable Integer id) {
        service.borrar(id);
    }

}
