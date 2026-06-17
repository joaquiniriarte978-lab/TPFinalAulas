package com.TrabajoFinal.Aulas.Controller;

import com.TrabajoFinal.Aulas.Dtos.usuarioDTO.UsuarioRequestDTO;
import com.TrabajoFinal.Aulas.Dtos.usuarioDTO.UsuarioResponseDTO;
import com.TrabajoFinal.Aulas.model.Usuario;
import com.TrabajoFinal.Aulas.service.UsuarioService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import com.TrabajoFinal.Aulas.Repository.ProfesorRepository;
import com.TrabajoFinal.Aulas.model.enums.Rol;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/usuarios")
public class UsuarioController {

    private final UsuarioService usuarioService;
    private final ProfesorRepository profesorRepository;

    @GetMapping
    public List<UsuarioResponseDTO> Usuarios() {
        List<Usuario> usuarios = usuarioService.listarTodos();
        return usuarios.stream()
                .map(this::convertirADto)
                .toList();
    }

    @PostMapping
    public UsuarioResponseDTO crear(@Valid @RequestBody UsuarioRequestDTO dto){
        Usuario saved = usuarioService.subirUsuario(dto);
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
    public UsuarioResponseDTO modificar(@PathVariable Integer id_usuario, @Valid @RequestBody UsuarioRequestDTO usuarioNuevo) {
        Usuario updated = usuarioService.modificar(id_usuario, usuarioNuevo);
        return convertirADto(updated);
    }

    private UsuarioResponseDTO convertirADto(Usuario usuario) {
        UsuarioResponseDTO dto = new UsuarioResponseDTO();
        dto.setId(usuario.getId());
        dto.setNombre(usuario.getNombre());
        dto.setEmail(usuario.getEmail());
        dto.setRol(usuario.getRol());

        if (usuario.getRol() == Rol.PROFESOR) {
            profesorRepository.findByUsuarioId(usuario.getId())
                    .ifPresent(profesor -> dto.setMateriasIds(
                            profesor.getMaterias()
                                    .stream()
                                    .map(materia -> materia.getId())
                                    .toList()
                    ));
        }

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
    @PutMapping("/me")
    public UsuarioResponseDTO modificarMiPerfil(Authentication authentication,
                                                @Valid @RequestBody UsuarioRequestDTO usuarioNuevo) {
        Object principal = authentication.getPrincipal();
        Integer id;

        if (principal instanceof Usuario usuario) {
            id = usuario.getId();
        } else {
            throw new RuntimeException("Los usuarios de prueba no pueden modificar su perfil.");
        }

        Usuario updated = usuarioService.modificar(id, usuarioNuevo);
        return convertirADto(updated);
    }
}