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
    public UsuarioResponseDTO crear(@Valid @RequestBody Usuario usuario){
        Usuario saved = usuarioService.subirUsuario(usuario);
        return convertirADto(saved);
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
    public UsuarioResponseDTO modificar(@PathVariable Integer id_usuario, @Valid @RequestBody Usuario usuarioNuevo) {
        Usuario updated = usuarioService.modificar(id_usuario, usuarioNuevo);
        return convertirADto(updated);
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
        Object principal = authentication.getPrincipal();

        if (principal instanceof Usuario usuario) {
            return convertirADto(usuario);
        }

        String username = authentication.getName();
        String rol = authentication.getAuthorities().stream()
                .findFirst()
                .map(authority -> authority.getAuthority().replace("ROLE_", ""))
                .orElse("ALUMNO");

        UsuarioResponseDTO dto = new UsuarioResponseDTO();
        dto.setNombre(username);
        dto.setEmail(username);
        dto.setRol(com.TrabajoFinal.Aulas.model.enums.Rol.valueOf(rol));
        return dto;
    }
}