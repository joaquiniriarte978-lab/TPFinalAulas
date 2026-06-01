package com.TrabajoFinal.Aulas.Repository;

import com.TrabajoFinal.Aulas.model.Materia;
import com.TrabajoFinal.Aulas.model.ProfesorMateria;
import com.TrabajoFinal.Aulas.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProfesorMateriaRepository extends JpaRepository<ProfesorMateria, Integer> {

}