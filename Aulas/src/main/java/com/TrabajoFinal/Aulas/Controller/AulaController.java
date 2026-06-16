package com.TrabajoFinal.Aulas.Controller;

import com.TrabajoFinal.Aulas.model.Aula;
import com.TrabajoFinal.Aulas.service.AulaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/aulas")
public class AulaController {
    private final AulaService aulaService;

    @GetMapping
    public List<Aula> Aulas() {
        return aulaService.listarAulas();
    }

    @PostMapping
    public Aula crear(@Valid @RequestBody Aula aula) {
        return aulaService.guardarAula(aula);
    }

    @GetMapping("/{id_aula}")
    public Aula buscar(@PathVariable Integer id_aula)  {
        return aulaService.aulaXid(id_aula);
    }

    @DeleteMapping("/{id_aula}")
    public void eliminar(@PathVariable Integer id_aula)  {
        aulaService.borrarAula(id_aula);
    }

    @PutMapping("/{id_aula}")
    public Aula modificar(@PathVariable Integer id_aula, @Valid @RequestBody Aula aulaNueva) {
        return aulaService.modificarAula(id_aula, aulaNueva);
    }
}