package com.TrabajoFinal.Aulas.Dtos.avisoDTO;



import lombok.Data;
import java.time.LocalDate;

@Data
public class AvisoResponseDTO {
    private Integer id_avso;
    private Integer id_aula;
    private String nombreAula;
    private String mensaje;
    private String estado;
    private LocalDate fecha;
}
