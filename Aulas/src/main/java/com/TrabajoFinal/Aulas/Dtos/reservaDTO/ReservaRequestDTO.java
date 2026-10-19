package com.TrabajoFinal.Aulas.Dtos.reservaDTO;

import jakarta.validation.constraints.NotNull;

import lombok.Data;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
public class ReservaRequestDTO {
    @NotNull(message = "La comisión es obligatoria")
    private Integer id_comision;

    @NotNull(message = "El aula es obligatoria")
    private Integer id_aula;

    @NotNull(message = "La fecha es obligatoria")
    private LocalDate fecha;

    @NotNull(message = "La hora de inicio es obligatoria")
    private LocalTime horaInicio;

    @NotNull(message = "La hora de fin es obligatoria")
    private LocalTime horaFin;

    private Boolean liberarClaseFija = false;
}
