package com.TrabajoFinal.Aulas.Dtos.ResponseDto;

import lombok.Data;

@Data
public class UsuarioResponseDTO {
    private Integer id_usuario;
    private String nombre;
    private String email;
    private String rol;
}