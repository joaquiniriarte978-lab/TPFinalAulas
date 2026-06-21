package com.TrabajoFinal.Aulas.Repository;

import com.TrabajoFinal.Aulas.model.ClaseFija;
import com.TrabajoFinal.Aulas.model.enums.DiaSemana;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
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

    @Query("SELECT COUNT(cf) > 0 FROM ClaseFija cf " +
           "WHERE cf.aula.id = :idAula " +
           "AND cf.diaSemana = :diaSemana " +
           "AND cf.horaInicio < :horaFin " +
           "AND cf.horaFin > :horaInicio " +
           "AND (:excluirClaseFijaId IS NULL OR cf.id <> :excluirClaseFijaId)")
    boolean existeConflictoExcluyendo(@Param("idAula") Integer idAula,
                                      @Param("diaSemana") DiaSemana diaSemana,
                                      @Param("horaInicio") LocalTime horaInicio,
                                      @Param("horaFin") LocalTime horaFin,
                                      @Param("excluirClaseFijaId") Integer excluirClaseFijaId);

    @Query("""
        SELECT COUNT(cf) > 0 FROM ClaseFija cf
        WHERE cf.comision.profesor.usuario.email = :emailProfesor
          AND cf.aula.id = :idAula
          AND cf.diaSemana = :diaSemana
          AND cf.horaFin <= :ahora
          AND cf.comision.fechaInicio <= :hoy
          AND cf.comision.fechaFin >= :hoy
    """)
    boolean existeClaseFijaTerminadaHoy(
            @Param("emailProfesor") String emailProfesor,
            @Param("idAula")        Integer idAula,
            @Param("diaSemana")     DiaSemana diaSemana,
            @Param("hoy")           LocalDate hoy,
            @Param("ahora")         LocalTime ahora
    );

    @Query("""
        SELECT COUNT(cf) > 0 FROM ClaseFija cf
        WHERE cf.comision.profesor.usuario.email = :emailProfesor
          AND cf.aula.id = :idAula
          AND cf.comision.fechaInicio <= :hoy
          AND cf.comision.fechaFin >= :hoy
    """)
    boolean tieneClaseFijaActiva(
            @Param("emailProfesor") String emailProfesor,
            @Param("idAula")        Integer idAula,
            @Param("hoy")           LocalDate hoy
    );
}