package com.TrabajoFinal.Aulas.Dtos.reservaDTO;


import lombok.Data;
import java.time.LocalDate;
import java.time.LocalTime;

@Data
public class ReservaResponseDTO {
    private Integer id_comision;
    private Integer id_aula;
    private LocalDate fecha;
    private LocalTime horaInicio;
    private LocalTime horaFin;
}
