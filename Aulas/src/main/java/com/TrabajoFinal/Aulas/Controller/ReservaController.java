package com.TrabajoFinal.Aulas.Controller;

import com.TrabajoFinal.Aulas.Dtos.reservaDTO.*;
import com.TrabajoFinal.Aulas.service.ReservaService;

import jakarta.validation.Valid;

import lombok.RequiredArgsConstructor;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/reservas")
public class ReservaController {
    private final ReservaService service;

    private boolean admin(Authentication a) {
        return a.getAuthorities().stream().anyMatch(r -> r.getAuthority().equals("ROLE_ADMIN"));
    }

    @GetMapping
    public List<ReservaResponseDTO> listar(Authentication a) {
        return service.listarReservas(a.getName(), admin(a)).stream()
                .map(r -> service.dto(r, a.getName(), admin(a)))
                .toList();
    }

    @GetMapping("/materia/{id}")
    public List<ReservaResponseDTO> porMateria(@PathVariable Integer id, Authentication a) {
        return service.listarReservas(a.getName(), admin(a)).stream()
                .filter(r -> r.getComision().getMateria().getId().equals(id))
                .map(r -> service.dto(r, a.getName(), admin(a)))
                .toList();
    }

    @GetMapping("/{id}")
    public ReservaResponseDTO detalle(@PathVariable Integer id, Authentication a) {
        var r = service.listarXId(id);
        if (!service.visible(r, a.getName(), admin(a)))
            throw new AccessDeniedException("No podés consultar ese historial.");
        return service.dto(r, a.getName(), admin(a));
    }

    @PostMapping
    public ReservaResponseDTO crear(@Valid @RequestBody ReservaRequestDTO dto, Authentication a) {
        return service.dto(service.hacerReserva(dto, a.getName(), admin(a)), a.getName(), admin(a));
    }

    @PutMapping("/{id}")
    public ReservaResponseDTO editar(
            @PathVariable Integer id, @Valid @RequestBody ReservaRequestDTO dto, Authentication a) {
        return service.dto(
                service.modificarReserva(id, dto, a.getName(), admin(a)), a.getName(), admin(a));
    }

    @PutMapping("/cancelar/{id}")
    public void cancelar(@PathVariable Integer id, Authentication a) {
        service.cancelarReserva(id, a.getName(), admin(a));
    }

    @DeleteMapping("/{id}")
    public void eliminar(@PathVariable Integer id, Authentication a) {
        service.eliminarReserva(id, a.getName(), admin(a));
    }
}
