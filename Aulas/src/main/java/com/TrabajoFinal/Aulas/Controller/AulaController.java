package com.TrabajoFinal.Aulas.Controller;
import com.TrabajoFinal.Aulas.model.Aula;
import com.TrabajoFinal.Aulas.Repository.AulaRepository;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.Optional;

@RestController
@RequestMapping("/aulas")
public class AulaController {
    private final AulaRepository repository;
    public AulaController(AulaRepository repository) {
        this.repository = repository;
    }
    @GetMapping
    public Iterable<Aula> Aulas() {
        return repository.findAll();
    }
    @PostMapping
    public Aula crear(@RequestBody Aula aula) {
        return (Aula) repository.save(aula);
    }

    @GetMapping("{/id_aula}")
    public Aula buscar(@PathVariable Integer id_aula) {
        if (repository.existsById(id_aula)) {
            return  (Aula) repository.findAulaById_aula(id_aula).get();
        }else  {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Aula no encontrada");
        }
    }
    @DeleteMapping
    public void eliminar(@PathVariable Integer id_aula) {
        if(repository.existsById(id_aula)) {
            repository.deleteById(id_aula);
        }else{
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "El registro no existe");
        }
    }
    @PutMapping("/{id_aula}")
    public Aula actualizarAula(@PathVariable Integer id_aula, @RequestBody Aula aulaDetalles) {
        Optional<Aula> aulaOptional = repository.findById(id_aula);

        if (aulaOptional.isPresent()) {
            Aula aulaExistente = aulaOptional.get();

            aulaExistente.setNombre(aulaDetalles.getNombre());
            aulaExistente.setCapacidad(aulaDetalles.getCapacidad());
            aulaExistente.setTipo(aulaDetalles.getTipo());
            aulaExistente.setEquipamiento(aulaDetalles.getEquipamiento());

            return (Aula) repository.save(aulaExistente);
        } else {
            throw new RuntimeException("Aula no encontrada con id: " + id_aula);
        }
    }



}
