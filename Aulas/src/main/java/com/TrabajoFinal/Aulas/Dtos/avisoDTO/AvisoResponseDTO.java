package com.TrabajoFinal.Aulas.Dtos.avisoDTO;



import com.TrabajoFinal.Aulas.model.enums.Estado;
import lombok.Data;
import java.time.LocalDate;

@Data
public class AvisoResponseDTO {
    private Integer id_avso;
    private Integer id_aula;
    private Integer id_usuario;
    private String mensaje;
    private Estado estado;
    private LocalDate fecha;
}
