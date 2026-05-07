package com.TrabajoFinal.Aulas.Dtos.ResponseDto;



import lombok.Data;

@Data
public class ProfesorMateriaResponseDTO {
    private Integer id_profesor;
    private String nombreProfesor;
    private Integer id_materia;
    private String nombreMateria;
}