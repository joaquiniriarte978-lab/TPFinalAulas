package com.TrabajoFinal.Aulas.Dtos.comisionDTO;

import com.TrabajoFinal.Aulas.model.enums.Horario;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

@Data
public class ComisionRequestDTO {

    @NotNull(message = "El profesor es obligatorio")
    private Integer id_profesor;

    @NotNull(message = "La materia es obligatoria")
    private Integer id_materia;

    @NotNull(message = "La cantidad de alumnos es obligatorio")
    private Integer cantAlumnos;

    @NotNull(message = "El horario es obligatorio")
    private Horario horario;

    @NotNull(message = "La fecha de inicio es obligatoria")
    private LocalDate fechaInicio;

    @NotNull(message = "La fecha de fin es obligatoria")
    private LocalDate fechaFin;
}
