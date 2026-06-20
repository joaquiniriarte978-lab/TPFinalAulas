package com.TrabajoFinal.Aulas.Repository;

import com.TrabajoFinal.Aulas.model.ClaseFijaLiberada;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.Optional;

public interface ClaseFijaLiberadaRepository extends JpaRepository<ClaseFijaLiberada, Integer> {
    Optional<ClaseFijaLiberada> findByClaseFijaIdAndFecha(Integer claseFijaId, LocalDate fecha);
}