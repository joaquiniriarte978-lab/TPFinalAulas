package com.TrabajoFinal.Aulas.Repository;

import com.TrabajoFinal.Aulas.model.Reserva;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

public interface ReservaRepository extends JpaRepository<Reserva, Integer> {
    List<Reserva> findByFecha(LocalDate fecha);

    List<Reserva> findByComisionId(Integer comisionId);

    boolean existsByComisionId(Integer comisionId);

    @Query(
            """
                SELECT COUNT(r) > 0 FROM Reserva r
                WHERE r.aula.id = :idAula
                  AND r.fecha = :fecha
                  AND r.estadoReserva = 'RESERVADA'
                  AND r.horaInicio < :horaFin
                  AND r.horaFin > :horaInicio
            """)
    boolean existeConflicto(
            @Param("idAula") Integer idAula,
            @Param("fecha") LocalDate fecha,
            @Param("horaInicio") LocalTime horaInicio,
            @Param("horaFin") LocalTime horaFin);

    @Query(
"""
    SELECT r FROM Reserva r
    WHERE r.estadoReserva = 'RESERVADA'
      AND (r.fecha < :hoy OR (r.fecha = :hoy AND r.horaFin <= :ahora))
""")
    List<Reserva> findReservasVencidas(
            @Param("hoy") LocalDate hoy, @Param("ahora") LocalTime ahora);

    @Query(
            "SELECT r FROM Reserva r WHERE r.comision.materia.id = :idMateria AND r.estadoReserva ="
                + " 'RESERVADA'")
    List<Reserva> findReservasByMateria(@Param("idMateria") Integer idMateria);

    boolean existsByAulaId(Integer aulaId);

    void deleteByComisionProfesorId(Integer profesorId);

    @Query(
            """
                SELECT COUNT(r) > 0 FROM Reserva r
                WHERE r.comision.profesor.usuario.email = :emailProfesor
                  AND r.aula.id = :idAula
                  AND (r.fecha < :hoy OR (r.fecha = :hoy AND r.horaFin <= :ahora))
            """)
    boolean existeReservaTerminadaEnAula(
            @Param("emailProfesor") String emailProfesor,
            @Param("idAula") Integer idAula,
            @Param("hoy") LocalDate hoy,
            @Param("ahora") LocalTime ahora);
}
