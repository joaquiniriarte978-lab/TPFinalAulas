package com.TrabajoFinal.Aulas.Repository;

import com.TrabajoFinal.Aulas.model.Comision;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ComisionRepository extends JpaRepository<Comision, Integer> {

}