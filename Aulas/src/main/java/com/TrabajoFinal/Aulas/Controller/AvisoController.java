package com.TrabajoFinal.Aulas.Controller;

import com.TrabajoFinal.Aulas.Dtos.avisoDTO.*;
import com.TrabajoFinal.Aulas.model.Aula;
import com.TrabajoFinal.Aulas.model.enums.Estado;
import com.TrabajoFinal.Aulas.service.AvisoService;

import jakarta.validation.Valid;

import lombok.RequiredArgsConstructor;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/avisos")
public class AvisoController {
    private final AvisoService service;

    private boolean admin(Authentication a) {
        return a.getAuthorities().stream().anyMatch(r -> r.getAuthority().equals("ROLE_ADMIN"));
    }

    @GetMapping
    public List<AvisoResponseDTO> listar(Authentication a) {
        return service.listarAvisos().stream()
                .filter(
                        v ->
                                admin(a)
                                        || v.getUsuario().getEmail().equals(a.getName())
                                        || v.getEstado() == Estado.PENDIENTE)
                .map(v -> service.dto(v, a.getName()))
                .toList();
    }

    @GetMapping("/aulas-habilitadas")
    public List<Aula> aulas(Authentication a) {
        return service.aulasHabilitadas(a.getName(), admin(a));
    }

    @PostMapping
    public AvisoResponseDTO crear(@Valid @RequestBody AvisoRequestDTO dto, Authentication a) {
        return service.dto(service.guardarAviso(dto, a.getName()), a.getName());
    }

    @GetMapping("/{id}")
    public AvisoResponseDTO detalle(@PathVariable Integer id, Authentication a) {
        var v = service.avisoXid(id);
        if (!admin(a)
                && !v.getUsuario().getEmail().equals(a.getName())
                && v.getEstado() != Estado.PENDIENTE)
            throw new AccessDeniedException("Aviso de otro usuario.");
        return service.dto(v, a.getName());
    }

    @PutMapping("/{id}")
    public AvisoResponseDTO editar(
            @PathVariable Integer id, @Valid @RequestBody AvisoRequestDTO dto, Authentication a) {
        return service.dto(service.modificarAvisoProfesor(id, dto, a.getName()), a.getName());
    }

    @DeleteMapping("/{id}")
    public void eliminar(@PathVariable Integer id) {
        service.borrarAviso(id);
    }

    @PutMapping("/{id}/estado")
    public AvisoResponseDTO estado(
            @PathVariable Integer id, @Valid @RequestBody AvisoEstadoDTO dto, Authentication a) {
        return service.dto(service.cambiarEstado(id, dto.getEstado()), a.getName());
    }
}
