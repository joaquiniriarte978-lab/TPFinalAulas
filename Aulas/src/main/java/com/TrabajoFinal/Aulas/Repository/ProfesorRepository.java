package com.TrabajoFinal.Aulas.Repository;

import com.TrabajoFinal.Aulas.model.Profesor;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ProfesorRepository extends JpaRepository<Profesor,Integer> {
    List<Profesor> findByMateriasId (Integer idMateria);

    Optional<Profesor> findByUsuarioId(Integer usuarioId);
}
