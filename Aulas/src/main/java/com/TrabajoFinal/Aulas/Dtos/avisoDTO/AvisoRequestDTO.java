package com.TrabajoFinal.Aulas.Dtos.avisoDTO;



import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AvisoRequestDTO {

    @NotNull(message = "El aula es obligatoria")
    private Integer id_aula;

    @NotBlank(message = "El mensaje no puede estar vacío")
    private String mensaje;
}
