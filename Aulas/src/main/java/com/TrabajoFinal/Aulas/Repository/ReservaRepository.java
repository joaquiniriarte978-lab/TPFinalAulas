package com.TrabajoFinal.Aulas.Repository;

import com.TrabajoFinal.Aulas.model.Aula;
import com.TrabajoFinal.Aulas.model.Materia;
import com.TrabajoFinal.Aulas.model.Reserva;
import com.TrabajoFinal.Aulas.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

public interface ReservaRepository extends JpaRepository<Reserva, Integer> {
    public Optional<Reserva>  findById(Integer idreserva);

    public List<Reserva> findByReservaByProfesor(Usuario id_profesor);

    public List<Reserva> findReservaByAula(Aula id_aula);

    public List<Reserva> findReservaByMateria(Materia id_materia);

    public List<Reserva> findReservaByFecha(LocalDate fecha);

    public List<Reserva> findReservaByHoraInicio(LocalTime hora_inicio);

    public List<Reserva> findReservaByHoraFin(LocalTime hora_fin);
}
