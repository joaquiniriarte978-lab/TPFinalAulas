package com.TrabajoFinal.Aulas.Repository;

import com.TrabajoFinal.Aulas.model.Reserva;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ReservaRepository extends JpaRepository<Reserva, Integer> {
}
