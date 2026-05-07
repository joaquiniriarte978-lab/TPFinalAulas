package com.TrabajoFinal.Aulas.Dtos.RequestDtos;


import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class MateriaRequestDTO {

    @NotBlank(message = "El nombre es obligatorio")
    private String nombre;

    private boolean requiere_laboratorio;
}