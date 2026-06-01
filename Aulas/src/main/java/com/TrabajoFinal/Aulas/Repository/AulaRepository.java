package com.TrabajoFinal.Aulas.Repository;

import com.TrabajoFinal.Aulas.model.Aula;
import com.TrabajoFinal.Aulas.model.enums.Tipo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AulaRepository extends JpaRepository<Aula, Integer> {




}