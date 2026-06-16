package com.TrabajoFinal.Aulas.Controller;

import com.TrabajoFinal.Aulas.Repository.MateriaRepository;
import com.TrabajoFinal.Aulas.Repository.ProfesorRepository;
import com.TrabajoFinal.Aulas.model.Materia;
import com.TrabajoFinal.Aulas.model.Profesor;
import com.TrabajoFinal.Aulas.Repository.MateriaRepository;
import com.TrabajoFinal.Aulas.Repository.ProfesorRepository;
import com.TrabajoFinal.Aulas.service.ProfesorService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Service
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/profesores")
public class ProfesorController {

    private final ProfesorService profesorService;

    @PutMapping("/{idProfesor}/materia/{idMateria}")
    public Profesor asignarMateria(@PathVariable Integer idProfesor, @PathVariable Integer idMateria){

        return profesorService.asignarMateria(idProfesor,idMateria);
    }

    @GetMapping("/materia/{idMateria}")
    public List<Profesor> obtenerProfesoresPorMateria(
            @PathVariable Integer idMateria){

        return profesorService.buscarPorMateria(idMateria);
    }


}
