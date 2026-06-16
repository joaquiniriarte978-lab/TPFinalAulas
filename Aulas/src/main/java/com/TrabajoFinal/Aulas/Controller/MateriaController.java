package com.TrabajoFinal.Aulas.Controller;

import com.TrabajoFinal.Aulas.Repository.MateriaRepository;
import com.TrabajoFinal.Aulas.model.Materia;
import com.TrabajoFinal.Aulas.service.MateriaService;
import lombok.AllArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/materias")
@RequiredArgsConstructor
public class    MateriaController {
    private final MateriaService materiaService;


    @GetMapping
    public List<Materia> Materias() {
        return materiaService.listar();
    }

    @PostMapping
    public Materia crear(@RequestBody Materia materia) {
        return materiaService.guardar(materia);
    }

    @GetMapping("/{id_materia}")
    public Materia buscar(@PathVariable Integer id_materia) {
        return materiaService.listarPorId(id_materia);
    }

    @DeleteMapping("/{id_materia}")
    public void eliminar(@PathVariable Integer id_materia) {
        materiaService.borrar(id_materia);
    }


    @PutMapping("/{id_materia}")
    public Materia actualizarAula(@PathVariable Integer id_materia, @RequestBody Materia materiaDetalles) {
        return materiaService.actualizar(id_materia, materiaDetalles);
    }

    @GetMapping("/Laboratorio")
    public List<Materia> listarMateriasLaboratorio() {
        return materiaService.listarMateriasLaboratorios();
    }
}



