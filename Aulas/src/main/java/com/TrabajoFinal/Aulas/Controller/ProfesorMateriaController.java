package com.TrabajoFinal.Aulas.Controller;

import com.TrabajoFinal.Aulas.Repository.ProfesorMateriaRepository;
import com.TrabajoFinal.Aulas.model.ProfesorMateria;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping ("{profesor-materias}")
public class ProfesorMateriaController {


    private final ProfesorMateriaRepository repository;

    public ProfesorMateriaController(ProfesorMateriaRepository repository) {
        this.repository = repository;
    }

    @PostMapping
    public ProfesorMateria crearProfesorMateria(ProfesorMateria profesorMateria) {
        return (ProfesorMateria) repository.save(profesorMateria);
    }

    @GetMapping
    public List<ProfesorMateria> findAll (){
        return repository.findAll();
    }

    @GetMapping("{id_profesor_materia}")
    public ProfesorMateria findById(@PathVariable Integer id_profesor_materia){
        if(repository.existsById(id_profesor_materia)){
            return (ProfesorMateria) repository.findById(id_profesor_materia).get();
        }
        else throw new RuntimeException("Id no encontrado");
    }

    @DeleteMapping
    public void delete (@PathVariable Integer id_profesor_materia){
        if(repository.existsById(id_profesor_materia)){
            repository.deleteById(id_profesor_materia);
        }
        else throw new RuntimeException("Id no encontrado");
    }


    @PutMapping("{id_profesor_materia}")
    public ProfesorMateria profesorMateria (@PathVariable Integer id_profesor_materia, @RequestBody ProfesorMateria actualizado) {
        if (repository.existsById(id_profesor_materia)) {
            ProfesorMateria pm = (ProfesorMateria) repository.findById(id_profesor_materia).get();
            pm.setId_materia(actualizado.getId_materia());
            pm.setId_profesor(actualizado.getId_profesor());
            return (ProfesorMateria) repository.save(pm);
        } else {
            throw new RuntimeException("Id no encontrado");
        }
    }
}
