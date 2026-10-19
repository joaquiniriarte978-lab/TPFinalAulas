package com.TrabajoFinal.Aulas.Repository;

import com.TrabajoFinal.Aulas.model.Aula;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AulaRepository extends JpaRepository<Aula, Integer> {
    @org.springframework.data.jpa.repository.Lock(
            jakarta.persistence.LockModeType.PESSIMISTIC_WRITE)
    @org.springframework.data.jpa.repository.Query("select a from Aula a order by a.id")
    List<Aula> bloquearAgenda();
}
