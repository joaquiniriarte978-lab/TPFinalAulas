package com.TrabajoFinal.Aulas.Repository;

import com.TrabajoFinal.Aulas.model.Rol;
import com.TrabajoFinal.Aulas.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UsuarioRepository extends JpaRepository<Usuario,Integer> {
    Optional<Usuario> findByEmail(String email);


    List<Usuario> findByNombre(String nombre);


    List<Usuario> findByRol(Rol rol);
}
