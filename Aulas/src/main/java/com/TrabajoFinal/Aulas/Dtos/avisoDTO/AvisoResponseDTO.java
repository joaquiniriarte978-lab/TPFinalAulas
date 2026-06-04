package com.TrabajoFinal.Aulas.Dtos.avisoDTO;



import com.TrabajoFinal.Aulas.model.enums.Estado;
import lombok.Data;
import java.time.LocalDate;

@Data
public class AvisoResponseDTO {
    private Integer idAula;
    private Integer idUsuario;
    private String mensaje;
    private LocalDate fecha;
    private Estado estado;
}
