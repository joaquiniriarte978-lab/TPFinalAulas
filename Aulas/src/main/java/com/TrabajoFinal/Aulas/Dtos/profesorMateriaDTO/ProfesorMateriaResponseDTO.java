package com.TrabajoFinal.Aulas.Dtos.profesorMateriaDTO;



import lombok.Data;

@Data
public class ProfesorMateriaResponseDTO {
    private Integer id_profesor;
    private String nombreProfesor;
    private Integer id_materia;
    private String nombreMateria;
}