package com.TrabajoFinal.Aulas.Dtos.materiaDTO;


import lombok.Data;

@Data
public class MateriaResponseDTO {
    private Integer id_materia;
    private String nombre;
    private boolean requiere_laboratorio;
}