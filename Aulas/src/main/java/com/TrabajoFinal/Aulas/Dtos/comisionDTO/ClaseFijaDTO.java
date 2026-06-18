package com.TrabajoFinal.Aulas.Dtos.comisionDTO;

import com.TrabajoFinal.Aulas.model.enums.DiaSemana;
import lombok.Data;

import java.time.LocalTime;

@Data
public class ClaseFijaDTO {
    private Integer id;
    private Integer id_comision;
    private Integer id_aula;
    private String  aulaNombre;
    private DiaSemana diaSemana;
    private LocalTime horaInicio;
    private LocalTime horaFin;
}