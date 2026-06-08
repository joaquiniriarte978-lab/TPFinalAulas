package com.TrabajoFinal.Aulas.Dtos.usuarioDTO;

import com.TrabajoFinal.Aulas.model.enums.Rol;
import lombok.Data;

@Data
public class UsuarioResponseDTO {
    private String nombre;
    private String email;
    private Rol rol;
}