package com.TrabajoFinal.Aulas.Dtos.avisoDTO;

import com.TrabajoFinal.Aulas.model.enums.Estado;

import lombok.Data;

@Data
public class AvisoEstadoDTO {
    @jakarta.validation.constraints.NotNull private Estado estado;
}
