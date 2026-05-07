package com.TrabajoFinal.Aulas.Dtos.ResponseDto;



import lombok.Data;

@Data
public class AulaResponseDTO {
    private Integer id_aula;
    private String nombre;
    private Integer capacidad;
    private String tipo;
    private String equipamiento;
}