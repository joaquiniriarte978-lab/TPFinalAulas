package com.TrabajoFinal.Aulas.Dtos.comisionDTO;

import com.TrabajoFinal.Aulas.model.enums.DiaSemana;

import lombok.Data;

import java.time.LocalTime;

@Data
public class ClaseFijaDTO {
    private Integer id;

    @jakarta.validation.constraints.NotNull(message = "La comisión es obligatoria")
    private Integer id_comision;

    @jakarta.validation.constraints.NotNull(message = "El aula es obligatoria")
    private Integer id_aula;

    private String aulaNombre;

    @jakarta.validation.constraints.NotNull(message = "El día es obligatorio")
    private DiaSemana diaSemana;

    @jakarta.validation.constraints.NotNull(message = "La hora de inicio es obligatoria")
    private LocalTime horaInicio;

    @jakarta.validation.constraints.NotNull(message = "La hora de fin es obligatoria")
    private LocalTime horaFin;
}
