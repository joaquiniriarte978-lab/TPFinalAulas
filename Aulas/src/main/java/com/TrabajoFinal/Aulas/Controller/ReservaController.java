package com.TrabajoFinal.Aulas.Controller;


import com.TrabajoFinal.Aulas.Dtos.reservaDTO.ReservaResponseDTO;
import com.TrabajoFinal.Aulas.Repository.ReservaRepository;
import com.TrabajoFinal.Aulas.model.Aula;
import com.TrabajoFinal.Aulas.model.Aviso;
import com.TrabajoFinal.Aulas.model.Reserva;
import com.TrabajoFinal.Aulas.service.ReservaService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/reservas")
public class ReservaController {

    private final ReservaService reservaService;

    @GetMapping
    public List<Reserva> Reservas() {
        return reservaService.listarReservas();
    }
    @PostMapping
    public Reserva crear(@RequestBody ReservaResponseDTO reserva){
        return reservaService.hacerReserva(reserva);
    }
    @GetMapping("/{id_reserva}")
    public Reserva buscar(@PathVariable Integer id_reserva)  {
        return reservaService.listarXId(id_reserva);
    }
    @DeleteMapping("/{id_reserva}")
    public void eliminar(@PathVariable Integer id_reserva)  {
        reservaService.eliminarReserva(id_reserva);
    }
    @PutMapping("/{id_reserva}")
    public Reserva modificar(@PathVariable Integer id_reserva, @RequestBody ReservaResponseDTO reservaNueva) {
        return reservaService.modificarReserva(id_reserva, reservaNueva);
    }
    @PutMapping("/cancelar/{id_reserva}")
    @ResponseStatus(HttpStatus.OK)
    public Reserva cancelar(@PathVariable Integer id_reserva) {
        return reservaService.cancelarReserva(id_reserva);
    }
}
