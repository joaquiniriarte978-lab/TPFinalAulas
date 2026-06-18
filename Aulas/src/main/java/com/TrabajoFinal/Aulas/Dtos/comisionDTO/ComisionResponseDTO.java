package com.TrabajoFinal.Aulas.Dtos.comisionDTO;

import com.TrabajoFinal.Aulas.model.enums.Horario;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

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
    private Horario horario;
    private LocalDate fechaInicio;
    private LocalDate fechaFin;
    private ClaseFijaDTO claseFija;
}