package com.TrabajoFinal.Aulas.model;

import com.TrabajoFinal.Aulas.model.enums.Horario;
import jakarta.persistence.*;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
@Table(name="comision")
public class Comision {
    @Id
    @GeneratedValue(strategy= GenerationType.IDENTITY)
    @Column(name = "id_comision")
    private Integer id;
    @ManyToOne
    @JoinColumn(name = "id_profesor")
    private Profesor profesor;
    @ManyToOne
    @JoinColumn(name = "id_materia")
    private Materia materia;

    @NotNull(message = "La cantidad de alumnos es obligatoria")
    @Min(value = 1, message = "La comisión debe tener al menos 1 alumno")
    @Max(value = 100, message = "La cantidad máxima permitida de alumnos es 100")
    @Column(name = "cant_alumnos")
    private Integer cantAlumnos;

    @NotNull(message = "El horario es obligatorio")
    @Enumerated(EnumType.STRING)
    @Column(name = "horario")
    private Horario horario;

    @NotNull(message = "La fecha de inicio es obligatoria")
    @Column(name = "fecha_inicio")
    private LocalDate fechaInicio;

    @NotNull(message = "La fecha de fin es obligatoria")
    @Column(name = "fecha_fin")
    private LocalDate fechaFin;




}
