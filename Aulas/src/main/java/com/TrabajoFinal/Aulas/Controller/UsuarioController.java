package com.TrabajoFinal.Aulas.Controller;

import com.TrabajoFinal.Aulas.Repository.UsuarioRepository;
import com.TrabajoFinal.Aulas.model.Usuario;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/usuarios")
public class UsuarioController {

    private final UsuarioRepository controller;

    public UsuarioController(@RequestBody UsuarioRepository controller) {
        this.controller = controller;
    }


    @PostMapping
    public Usuario crearUsuario(Usuario usuario) {
        return controller.save(usuario);
    }

    @GetMapping
    public List<Usuario> findAll() {
        return controller.findAll();
    }

    @GetMapping("{id_usuario}")
    public Optional<Usuario> findUsuario(@PathVariable Integer id_usuario) {
        if (controller.existsById(id_usuario)) {
            return  controller.findById(id_usuario);
        } else throw new RuntimeException("Usuario no encontrado");
    }


    @PutMapping("/{id}")
    public Usuario actualizarUsuario( @PathVariable Integer id_usuario , @RequestBody Usuario usuarioActualizado) {
     if (controller.existsById(id_usuario)) {
         Usuario usuario = controller.findById(id_usuario).get();
         usuario.setNombre(usuarioActualizado.getNombre());
         usuario.setEmail(usuarioActualizado.getEmail());
         usuario.setPassword(usuarioActualizado.getPassword());
         usuario.setRol(usuarioActualizado.getRol());


         return controller.save(usuario);
     }
     else throw new RuntimeException("Usuario no encontrado");
    }


    @DeleteMapping
    public void eliminarUsuario(@PathVariable Integer id_usuario) {
        if (controller.existsById(id_usuario)) {
            controller.deleteById(id_usuario);
        }
        else throw new RuntimeException("Usuario no encontrado ");
    }









}
