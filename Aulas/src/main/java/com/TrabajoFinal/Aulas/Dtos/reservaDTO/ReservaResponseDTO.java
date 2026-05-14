package com.TrabajoFinal.Aulas.Dtos.reservaDTO;


import lombok.Data;
import java.time.LocalDate;

@Data
public class ReservaResponseDTO {
    private Integer id_usuario;
    private Integer id_profesor;
    private String nombreProfesor;
    private Integer id_aula;
    private String nombreAula;
    private Integer id_turno;
    private String nombreTurno;
    private Integer id_materia;
    private String nombreMateria;
    private LocalDate fecha;
}
