package com.TrabajoFinal.Aulas.Dtos.ResponseDto;


import lombok.Data;

@Data
public class MateriaResponseDTO {
    private Integer id_materia;
    private String nombre;
    private boolean requiere_laboratorio;
}