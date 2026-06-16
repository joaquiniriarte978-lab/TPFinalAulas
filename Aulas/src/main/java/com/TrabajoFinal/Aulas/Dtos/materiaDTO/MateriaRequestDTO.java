package com.TrabajoFinal.Aulas.Dtos.materiaDTO;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class MateriaRequestDTO {

    @NotBlank(message = "El nombre es obligatorio")
    @Size(max = 20, message = "El nombre debe tener un máximo de 20 caracteres")
    private String nombre;

    private boolean requiere_laboratorio;
}