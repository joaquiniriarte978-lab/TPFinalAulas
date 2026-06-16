package com.TrabajoFinal.Aulas.Dtos.comisionDTO;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ComisionResponseDTO {
    private Integer id;

    @NotNull(message = "El profesor es obligatorio")
    private Integer id_profesor;

    @NotNull(message = "La materia es obligatoria")
    private Integer id_materia;

    @NotNull(message = "La cantidad de alumnos es obligatoria")
    @Min(value = 1, message = "La comisión debe tener al menos 1 alumno")
    @Max(value = 100, message = "La cantidad máxima permitida de alumnos es 100")
    private Integer cantAlumnos;

    private String materiaNombre;
    private String profesorNombre;
}