package com.TrabajoFinal.Aulas.Controller;

import com.TrabajoFinal.Aulas.Repository.UsuarioRepository;
import com.TrabajoFinal.Aulas.model.Reserva;
import com.TrabajoFinal.Aulas.model.Usuario;
import com.TrabajoFinal.Aulas.service.ReservaService;
import com.TrabajoFinal.Aulas.service.UsuarioService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequiredArgsConstructor
@RequestMapping("/usuarios")
public class UsuarioController {

    private final UsuarioService usuarioService;

    @GetMapping
    public List<Usuario> Usuarios() {
        return usuarioService.listarTodos();
    }
    @PostMapping
    public Usuario crear(@RequestBody Usuario usuario){
        return usuarioService.subirUsuario(usuario);
    }
    @GetMapping("{/id_usuario}")
    public Usuario buscar(@PathVariable Integer id_usuario)  {
        return usuarioService.buscarPorId(id_usuario);
    }
    @DeleteMapping
    public void eliminar(@PathVariable Integer id_usuario)  {
        usuarioService.eliminarUsuario(id_usuario);
    }
    @PutMapping("/{id_usuario}")
    public Usuario modificar(@PathVariable Integer id_usuario, @RequestBody Usuario usuarioNuevo) {
        return usuarioService.modificar(id_usuario, usuarioNuevo);
    }









}
