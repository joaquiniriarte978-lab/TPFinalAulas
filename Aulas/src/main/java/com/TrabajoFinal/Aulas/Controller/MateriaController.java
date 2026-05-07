package com.TrabajoFinal.Aulas.Controller;

import com.TrabajoFinal.Aulas.Repository.MateriaRepository;
import com.TrabajoFinal.Aulas.model.Materia;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.Optional;

@RestController
@RequestMapping("/materias")
public class MateriaController {
    private final MateriaRepository materiaRepository;

    public MateriaController(MateriaRepository materiaRepository) {
        this.materiaRepository = materiaRepository;
    }

    @GetMapping
    public Iterable<Materia> Materias() {
        return materiaRepository.findAll();
    }
    @PostMapping
    public Materia crear(@RequestBody Materia materia) {
        return (Materia) materiaRepository.save(materia);
    }

    @GetMapping("{/id_materia}")
    public Materia buscar(@PathVariable Integer id_materia) {
        if (materiaRepository.existsById(id_materia)) {
            return  (Materia) materiaRepository.findMateriaById_materia(id_materia).get();
        }else  {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Aula no encontrada");
        }
    }
    @DeleteMapping
    public void eliminar(@PathVariable Integer id_materia) {
        if(materiaRepository.existsById(id_materia)) {
            materiaRepository.deleteById(id_materia);
        }else{
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "El registro no existe");
        }
    }
    @PutMapping("/{id_materia}")
    public Materia actualizarAula(@PathVariable Integer id_materia, @RequestBody Materia materiaDetalles) {
        Optional<Materia> materiaOptional = materiaRepository.findById(id_materia);

        if (materiaOptional.isPresent()) {
            Materia materiaExistente = materiaOptional.get();

            materiaExistente.setNombre(materiaDetalles.getNombre());
            materiaExistente.setRequiere_laboratorio(materiaDetalles.isRequiere_laboratorio());
            materiaRepository.save(materiaExistente);
            return (Materia) materiaRepository.save(materiaExistente);
        } else {
            throw new RuntimeException("Aviso no encontrada con id: " + id_materia);
        }
    }
}
