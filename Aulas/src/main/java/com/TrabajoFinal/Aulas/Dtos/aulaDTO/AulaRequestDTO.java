package com.TrabajoFinal.Aulas.Dtos.aulaDTO;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class AulaRequestDTO {

    @NotBlank(message = "El nombre es obligatorio")
    @Size(max = 20, message = "El nombre debe tener un máximo de 20 caracteres")
    private String nombre;

    @NotNull(message = "La capacidad es obligatoria")
    @Min(value = 1, message = "La capacidad mínima debe ser 1")
    @Max(value = 100, message = "La capacidad máxima permitida es 100")
    private Integer capacidad;

    @NotBlank(message = "El tipo es obligatorio")
    private String tipo;

    private String equipamiento;
}