package com.TrabajoFinal.Aulas.Repository;

import com.TrabajoFinal.Aulas.model.ClaseFija;
import com.TrabajoFinal.Aulas.model.enums.DiaSemana;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalTime;
import java.util.Optional;

public interface ClaseFijaRepository extends JpaRepository<ClaseFija, Integer> {

    Optional<ClaseFija> findByComisionId(Integer comisionId);

    @Query("SELECT COUNT(cf) > 0 FROM ClaseFija cf " +
           "WHERE cf.aula.id = :idAula " +
           "AND cf.diaSemana = :diaSemana " +
           "AND cf.horaInicio < :horaFin " +
           "AND cf.horaFin > :horaInicio")
    boolean existeConflicto(@Param("idAula") Integer idAula,
                            @Param("diaSemana") DiaSemana diaSemana,
                            @Param("horaInicio") LocalTime horaInicio,
                            @Param("horaFin") LocalTime horaFin);
}