package com.TrabajoFinal.Aulas.Dtos.comisionDTO;


import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ComisionRequestDTO {

    @NotNull(message = "El profesor es obligatorio")
    private Integer id_profesor;

    @NotNull(message = "La materia es obligatoria")
    private Integer id_materia;

    @NotNull(message = "La cantidad de alumnos es obligatorio")
    private Integer cantAlumnos;
}
