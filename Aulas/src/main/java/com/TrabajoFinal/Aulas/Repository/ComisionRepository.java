package com.TrabajoFinal.Aulas.Repository;

import com.TrabajoFinal.Aulas.model.Comision;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ComisionRepository extends JpaRepository<Comision, Integer> {
    List<Comision> findByProfesorUsuarioEmail(String email);

    List<Comision> findByMateriaId(Integer idMateria);

    void deleteByProfesorId(Integer profesorId);

    boolean existsByProfesorId(Integer profesorId);

    boolean existsByMateriaId(Integer materiaId);

    boolean existsByProfesorIdAndFechaFinGreaterThanEqual(
            Integer profesorId, java.time.LocalDate fecha);

    List<Comision> findByProfesorIdAndFechaFinGreaterThanEqual(
            Integer profesorId, java.time.LocalDate fecha);
}
