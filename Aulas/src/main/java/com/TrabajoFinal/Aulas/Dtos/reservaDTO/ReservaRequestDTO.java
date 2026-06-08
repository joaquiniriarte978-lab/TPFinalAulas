package com.TrabajoFinal.Aulas.Dtos.reservaDTO;



import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.time.LocalDate;

@Data
public class ReservaRequestDTO {

    @NotNull(message = "El aula es obligatoria")
    private Integer id_aula;

    @NotNull(message = "La fecha es obligatoria")
    private LocalDate fecha;
}