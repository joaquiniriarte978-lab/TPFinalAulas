package com.TrabajoFinal.Aulas.Controller;


import com.TrabajoFinal.Aulas.Dtos.reservaDTO.ReservaResponseDTO;
import com.TrabajoFinal.Aulas.Repository.ReservaRepository;
import com.TrabajoFinal.Aulas.model.Aula;
import com.TrabajoFinal.Aulas.model.Aviso;
import com.TrabajoFinal.Aulas.model.Reserva;
import com.TrabajoFinal.Aulas.service.ReservaService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/reservas")
public class ReservaController {

    private final ReservaService reservaService;

    @GetMapping("/materia/{id_materia}")
    public List<Reserva> buscarPorMateria(@PathVariable Integer id_materia) {
        return reservaService.listarPorMateria(id_materia);
    }
    @GetMapping
    public List<Reserva> Reservas(Authentication authentication) {
        String email = authentication.getName();

        boolean esAdmin = authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

        return reservaService.listarReservas(email, esAdmin);
    }
    @PostMapping
    public Reserva crear(@RequestBody ReservaResponseDTO reserva, Authentication authentication) {
        String email = authentication.getName();
        boolean esAdmin = authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        return reservaService.hacerReserva(reserva, email, esAdmin);
    }
    @GetMapping("/{id_reserva}")
    public Reserva buscar(@PathVariable Integer id_reserva)  {
        return reservaService.listarXId(id_reserva);
    }
    @DeleteMapping("/{id_reserva}")
    public void eliminar(@PathVariable Integer id_reserva, Authentication authentication) {
        String email = authentication.getName();
        boolean esAdmin = authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        reservaService.eliminarReserva(id_reserva, email, esAdmin);
    }
    @PutMapping("/{id_reserva}")
    public Reserva modificar(@PathVariable Integer id_reserva, @RequestBody ReservaResponseDTO reservaNueva, Authentication authentication) {
        String email = authentication.getName();
        boolean esAdmin = authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        return reservaService.modificarReserva(id_reserva, reservaNueva, email, esAdmin);
    }
    @PutMapping("/cancelar/{id_reserva}")
    @ResponseStatus(HttpStatus.OK)
    public Reserva cancelar(@PathVariable Integer id_reserva, Authentication authentication) {
        String email = authentication.getName();
        boolean esAdmin = authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        return reservaService.cancelarReserva(id_reserva, email, esAdmin);
    }
}