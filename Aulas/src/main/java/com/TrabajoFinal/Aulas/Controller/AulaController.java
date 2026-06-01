package com.TrabajoFinal.Aulas.Controller;
import com.TrabajoFinal.Aulas.model.Aula;
import com.TrabajoFinal.Aulas.Repository.AulaRepository;
import com.TrabajoFinal.Aulas.service.AulaService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;

@RestController
@RequiredArgsConstructor
@RequestMapping("/aulas")
public class AulaController {
    private final AulaService aulaService;

    @GetMapping
    public List<Aula> Aulas() {
        return aulaService.listarAulas();
    }
    @PostMapping
    public Aula crear(@RequestBody Aula aula) {
        return aulaService.guardarAula(aula);
    }

    @GetMapping("{/id_aula}")
    public Aula buscar(@PathVariable Integer id_aula)  {
        return aulaService.aulaXid(id_aula);
    }
    @DeleteMapping
    public void eliminar(@PathVariable Integer id_aula)  {
        aulaService.borrarAula(id_aula);
    }
    @PostMapping
    public Aula saveAula(@RequestBody Aula aulaDetalles) {
        return aulaService.guardarAula( aulaDetalles);
    }

    @PutMapping("/{id_aula}")
    public Aula modificar(@PathVariable Integer id_aula, @RequestBody Aula aulaNueva) {
        return aulaService.modificarAula(id_aula, aulaNueva);
    }




}
