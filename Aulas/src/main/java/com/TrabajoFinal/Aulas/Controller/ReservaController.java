package com.TrabajoFinal.Aulas.Controller;


import com.TrabajoFinal.Aulas.Repository.ReservaRepository;
import com.TrabajoFinal.Aulas.model.Reserva;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("reservas")
public class ReservaController {

    private final  ReservaRepository repository;
    public ReservaController(ReservaRepository repository) {
        this.repository = repository;
    }

    @PostMapping
    public Reserva reserva(@RequestBody Reserva reserva) {
      return  repository.save(reserva);
    }

    @GetMapping
    public List<Reserva> findAll() {
        return repository.findAll();
    }

    @GetMapping ("{id_reserva}")
    public Reserva findById(@PathVariable Integer id_reserva) {
        if (repository.existsById(id_reserva)) {
            return repository.findById(id_reserva).get();
        }
        else throw new RuntimeException("Reserva no encontrada");
    }

    @DeleteMapping
    public void borrarReserva(@PathVariable Integer id_reserva) {
        if (repository.existsById(id_reserva)) {
            repository.deleteById(id_reserva);
        }
        else throw new RuntimeException("Reserva no encontrada");
    }



}
