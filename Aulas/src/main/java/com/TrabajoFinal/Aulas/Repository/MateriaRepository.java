package com.TrabajoFinal.Aulas.Repository;

import com.TrabajoFinal.Aulas.model.Materia;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MateriaRepository extends JpaRepository<Materia,Integer> {

    List<Materia> findMateriaByrequiereLaboratorio(boolean requiere_laboratorio);
}