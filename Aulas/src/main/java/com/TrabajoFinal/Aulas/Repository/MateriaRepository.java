package com.TrabajoFinal.Aulas.Repository;

import com.TrabajoFinal.Aulas.model.Aula;
import com.TrabajoFinal.Aulas.model.Materia;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MateriaRepository extends JpaRepository {


    public Optional findMateriaById_materia(Integer idmateria);

    public Optional findMateriaByNombre(String nombre);

    public List findMateriaByrequiere_laboratorio(boolean requiere_laboratorio);
}