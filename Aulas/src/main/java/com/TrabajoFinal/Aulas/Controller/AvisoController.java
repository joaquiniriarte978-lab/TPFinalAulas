package com.TrabajoFinal.Aulas.Controller;

import com.TrabajoFinal.Aulas.Repository.AvisoRepository;
import com.TrabajoFinal.Aulas.model.Aula;
import com.TrabajoFinal.Aulas.model.Aviso;
import com.TrabajoFinal.Aulas.service.AvisoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;


@RestController
@RequiredArgsConstructor
@RequestMapping("/avisos")
public class AvisoController {
    private final AvisoService avisoService;
    @GetMapping
    public List<Aviso> Avisos() {
        return avisoService.listarAvisos();
    }
    @PostMapping
    public Aviso crear(@RequestBody Aviso aviso) {
        return avisoService.guardarAviso(aviso);
    }

    @GetMapping("{/id_aviso}")
    public Aviso buscar(@PathVariable Integer id_aviso)  {
        return avisoService.avisoXid(id_aviso);
    }
    @DeleteMapping
    public void eliminar(@PathVariable Integer id_aviso)  {
        avisoService.borrarAula(id_aviso);
    }

    @PutMapping("/{id_aviso}")
    public Aviso modificar(@PathVariable Integer id_aviso, @RequestBody Aviso avisoNuevo) {
        return avisoService.modificarAviso(id_aviso, avisoNuevo);
    }
}
