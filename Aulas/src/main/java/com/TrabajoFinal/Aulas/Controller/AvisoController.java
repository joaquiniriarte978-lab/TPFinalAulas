package com.TrabajoFinal.Aulas.Controller;

import com.TrabajoFinal.Aulas.Dtos.avisoDTO.AvisoEstadoDTO;
import com.TrabajoFinal.Aulas.Dtos.avisoDTO.AvisoRequestDTO;
import com.TrabajoFinal.Aulas.Dtos.avisoDTO.AvisoResponseDTO;
import com.TrabajoFinal.Aulas.Repository.AvisoRepository;
import com.TrabajoFinal.Aulas.model.Aula;
import com.TrabajoFinal.Aulas.model.Aviso;
import com.TrabajoFinal.Aulas.service.AvisoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;


@RestController
@RequiredArgsConstructor
@RequestMapping("/api/avisos")
public class AvisoController {
    private final AvisoService avisoService;

    @GetMapping
    public List<Aviso> Avisos() {
        return avisoService.listarAvisos();
    }
    @PostMapping
    public Aviso crear(@Valid @RequestBody AvisoRequestDTO avisoDto,
                       Authentication authentication) {
        return avisoService.guardarAviso(avisoDto, authentication.getName());
    }
    @GetMapping("/{id_aviso}")
    public Aviso buscar(@PathVariable Integer id_aviso)  {
        return avisoService.avisoXid(id_aviso);
    }
    @DeleteMapping("/{id_aviso}")
    public void eliminar(@PathVariable Integer id_aviso)  {
        avisoService.borrarAviso(id_aviso);
    }

    @PutMapping("/{id_aviso}/estado")
    public Aviso cambiarEstado(@PathVariable Integer id_aviso,
                               @RequestBody AvisoEstadoDTO dto) {
        return avisoService.cambiarEstado(id_aviso, dto.getEstado());
    }
}
