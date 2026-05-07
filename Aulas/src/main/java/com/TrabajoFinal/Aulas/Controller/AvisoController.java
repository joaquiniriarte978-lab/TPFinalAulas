package com.TrabajoFinal.Aulas.Controller;

import com.TrabajoFinal.Aulas.Repository.AvisoRepository;
import com.TrabajoFinal.Aulas.model.Aula;
import com.TrabajoFinal.Aulas.model.Aviso;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.Optional;


@RestController
@RequestMapping("/avisos")
public class AvisoController {
    private final AvisoRepository avisoRepository;
    public AvisoController(AvisoRepository avisoRepository) {
        this.avisoRepository = avisoRepository;
    }
    @GetMapping
    public Iterable<Aviso> Avisos() {
        return avisoRepository.findAll();
    }
    @PostMapping
    public Aviso crear(@RequestBody Aviso aviso) {
        return (Aviso) avisoRepository.save(aviso);
    }

    @GetMapping("{/id_aviso}")
    public Aviso buscar(@PathVariable Integer id_aviso) {
        if (avisoRepository.existsById(id_aviso)) {
            return  (Aviso) avisoRepository.findAvisoById_aviso(id_aviso).get();
        }else  {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Aula no encontrada");
        }
    }
    @DeleteMapping
    public void eliminar(@PathVariable Integer id_aviso) {
        if(avisoRepository.existsById(id_aviso)) {
            avisoRepository.deleteById(id_aviso);
        }else{
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "El registro no existe");
        }
    }
    @PutMapping("/{id_aviso}")
    public Aviso actualizarAula(@PathVariable Integer id_aviso, @RequestBody Aviso avisoDetalles) {
        Optional<Aviso> avisoOptional = avisoRepository.findById(id_aviso);

        if (avisoOptional.isPresent()) {
            Aviso avisoExistente = avisoOptional.get();

            avisoExistente.setEstado(avisoDetalles.getEstado());
            avisoExistente.setFecha(avisoDetalles.getFecha());
            avisoExistente.setMensaje(avisoDetalles.getMensaje());
            avisoExistente.setId_aula(avisoDetalles.getId_aula());
            avisoRepository.save(avisoExistente);
            return (Aviso) avisoRepository.save(avisoExistente);
        } else {
            throw new RuntimeException("Aviso no encontrada con id: " + id_aviso);
        }
    }
}
