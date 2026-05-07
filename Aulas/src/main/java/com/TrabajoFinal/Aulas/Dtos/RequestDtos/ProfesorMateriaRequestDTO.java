package com.TrabajoFinal.Aulas.Dtos.RequestDtos;


import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ProfesorMateriaRequestDTO {

    @NotNull(message = "El profesor es obligatorio")
    private Integer id_profesor;

    @NotNull(message = "La materia es obligatoria")
    private Integer id_materia;
}
