package com.TrabajoFinal.Aulas.service;

import com.TrabajoFinal.Aulas.Dtos.usuarioDTO.UsuarioResponseDTO;
import com.TrabajoFinal.Aulas.Repository.UsuarioRepository;
import com.TrabajoFinal.Aulas.exceptions.ResourceNotFoundException;
import com.TrabajoFinal.Aulas.model.Usuario;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UsuarioService {
    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    public Usuario subirUsuario(Usuario usuario){
        String passwordEncriptado = passwordEncoder.encode(usuario.getPassword());
        usuario.setPassword(passwordEncriptado);
        return usuarioRepository.save(usuario);
    }
    public List<Usuario> listarTodos(){
        return usuarioRepository.findAll();
    }
    public Usuario buscarPorId(Integer id){
        return usuarioRepository.findById(id).orElseThrow(()->new ResourceNotFoundException("Usuario", id));
    }
    public Usuario modificar(Integer id, Usuario modificar){
        Usuario viejo=buscarPorId(id);
        viejo.setRol(modificar.getRol());
        viejo.setPassword(modificar.getPassword());
        viejo.setNombre(modificar.getNombre());
        viejo.setEmail(modificar.getEmail());
        return usuarioRepository.save(viejo);
    }
    public void eliminarUsuario(Integer id){
        usuarioRepository.deleteById(id);
    }
}
