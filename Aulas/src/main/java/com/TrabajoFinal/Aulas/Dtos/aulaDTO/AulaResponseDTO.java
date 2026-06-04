package com.TrabajoFinal.Aulas.Dtos.aulaDTO;



import com.TrabajoFinal.Aulas.model.enums.Tipo;
import jakarta.persistence.Table;
import lombok.Data;

@Data
public class AulaResponseDTO {
    private String nombre;
    private Integer capacidad;
    private Tipo tipo;
    private String equipamiento;
}