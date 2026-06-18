package com.TrabajoFinal.Aulas.service;

import com.TrabajoFinal.Aulas.Dtos.usuarioDTO.UsuarioRequestDTO;
import com.TrabajoFinal.Aulas.Dtos.usuarioDTO.UsuarioResponseDTO;
import com.TrabajoFinal.Aulas.Repository.ComisionRepository;
import com.TrabajoFinal.Aulas.Repository.MateriaRepository;
import com.TrabajoFinal.Aulas.Repository.ReservaRepository;
import com.TrabajoFinal.Aulas.Repository.UsuarioRepository;
import com.TrabajoFinal.Aulas.exceptions.ResourceNotFoundException;
import com.TrabajoFinal.Aulas.model.Materia;
import com.TrabajoFinal.Aulas.model.Usuario;
import com.TrabajoFinal.Aulas.model.Profesor;
import com.TrabajoFinal.Aulas.Repository.ProfesorRepository;
import com.TrabajoFinal.Aulas.model.enums.Rol;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UsuarioService {
    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final ProfesorRepository profesorRepository;
    private final MateriaRepository materiaRepository;
    private final ComisionRepository comisionRepository;
    private final ReservaRepository reservaRepository;

    public Usuario subirUsuario(UsuarioRequestDTO dto){

        if(usuarioRepository.existsByEmail(dto.getEmail())){
            throw new RuntimeException("El email ya está registrado");
        }
        if (dto.getPassword() == null || dto.getPassword().isBlank()) {
            throw new RuntimeException("La contraseña es obligatoria");
        }

        Usuario usuario = new Usuario();
        usuario.setNombre(dto.getNombre());
        usuario.setEmail(dto.getEmail());
        usuario.setPassword(passwordEncoder.encode(dto.getPassword()));
        usuario.setRol(Rol.valueOf(dto.getRol()));

        Usuario usuarioGuardado = usuarioRepository.save(usuario);

        if(usuarioGuardado.getRol().equals(Rol.PROFESOR)){

            Profesor profesor = new Profesor();
            profesor.setUsuario(usuarioGuardado);

            if(dto.getMateriasIds() != null && !dto.getMateriasIds().isEmpty()){
                List<Materia> materias = materiaRepository.findAllById(
                        dto.getMateriasIds().stream().distinct().toList()
                );
                profesor.setMaterias(materias);
            }

            profesorRepository.save(profesor);
        }

        return usuarioGuardado;
    }
    public List<Usuario> listarTodos(){
        return usuarioRepository.findAll();
    }
    public Usuario buscarPorId(Integer id){
        return usuarioRepository.findById(id).orElseThrow(()->new ResourceNotFoundException("Usuario", id));
    }
    @Transactional
    public Usuario modificar(Integer id, UsuarioRequestDTO dto){
        Usuario viejo = buscarPorId(id);

        if (!dto.getEmail().equals(viejo.getEmail()) && usuarioRepository.existsByEmail(dto.getEmail())) {
            throw new RuntimeException("El email ya está registrado");
        }

        Rol rolViejo = viejo.getRol();
        Rol rolNuevo = Rol.valueOf(dto.getRol());

        viejo.setNombre(dto.getNombre());
        viejo.setEmail(dto.getEmail());
        viejo.setRol(rolNuevo);

        if (dto.getPassword() != null && !dto.getPassword().isBlank()) {
            viejo.setPassword(passwordEncoder.encode(dto.getPassword()));
        }

        Usuario usuarioGuardado = usuarioRepository.save(viejo);

        if (rolViejo == Rol.PROFESOR && rolNuevo != Rol.PROFESOR) {
            profesorRepository.findByUsuarioId(id).ifPresent(profesor -> {
                reservaRepository.deleteByComisionProfesorId(profesor.getId());
                comisionRepository.deleteByProfesorId(profesor.getId());
                profesorRepository.delete(profesor);
            });
        } else if (rolNuevo == Rol.PROFESOR) {
            Profesor profesor = profesorRepository.findByUsuarioId(usuarioGuardado.getId())
                    .orElseGet(() -> {
                        Profesor nuevoProfesor = new Profesor();
                        nuevoProfesor.setUsuario(usuarioGuardado);
                        return nuevoProfesor;
                    });

            if (dto.getMateriasIds() != null) {
                List<Materia> materias = materiaRepository.findAllById(
                        dto.getMateriasIds().stream().distinct().toList()
                );
                profesor.setMaterias(materias);
            }

            profesorRepository.save(profesor);
        }

        return usuarioGuardado;
    }
    public void eliminarUsuario(Integer id){
        usuarioRepository.deleteById(id);
    }
}
