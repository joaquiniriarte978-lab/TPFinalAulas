package com.TrabajoFinal.Aulas.Controller;

import com.TrabajoFinal.Aulas.Dtos.usuarioDTO.UsuarioResponseDTO;
import com.TrabajoFinal.Aulas.model.Usuario;
import com.TrabajoFinal.Aulas.service.UsuarioService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/usuarios")
public class UsuarioController {

    private final UsuarioService usuarioService;

    @GetMapping
    public List<UsuarioResponseDTO> Usuarios() {
        List<Usuario> usuarios = usuarioService.listarTodos();
        return usuarios.stream()
                .map(this::convertirADto)
                .toList();
    }

    @PostMapping
    public Usuario crear(@Valid @RequestBody Usuario usuario){
        return usuarioService.subirUsuario(usuario);
    }

    @GetMapping("/{id_usuario}")
    public UsuarioResponseDTO buscar(@PathVariable Integer id_usuario)  {
        Usuario usuario = usuarioService.buscarPorId(id_usuario);
        return convertirADto(usuario);
    }

    @DeleteMapping("/{id_usuario}")
    public void eliminar(@PathVariable Integer id_usuario)  {
        usuarioService.eliminarUsuario(id_usuario);
    }

    @PutMapping("/{id_usuario}")
    public Usuario modificar(@PathVariable Integer id_usuario, @Valid @RequestBody Usuario usuarioNuevo) {
        return usuarioService.modificar(id_usuario, usuarioNuevo);
    }

    private UsuarioResponseDTO convertirADto(Usuario usuario) {
        UsuarioResponseDTO dto = new UsuarioResponseDTO();
        dto.setId(usuario.getId());
        dto.setNombre(usuario.getNombre());
        dto.setEmail(usuario.getEmail());
        dto.setRol(usuario.getRol());
        return dto;
    }
    @GetMapping("/me")
    public UsuarioResponseDTO miPerfil(Authentication authentication) {
        Usuario usuario = (Usuario) authentication.getPrincipal();
        return convertirADto(usuario);
    }
}