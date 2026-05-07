package com.TrabajoFinal.Aulas.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Objects;
@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "reserva")
public class Reserva {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id_reserva;
    @ManyToOne
    @JoinColumn(name = "id_profesor")
    private Usuario id_profesor;
    @ManyToOne
    @JoinColumn(name = "id_aula")
    private Aula id_aula;
    @ManyToOne
    @JoinColumn(name = "id_materia")
    private Materia id_materia;
    private LocalDate fecha;
    private LocalTime hora_inicio;
    private LocalTime hora_fin;



}
