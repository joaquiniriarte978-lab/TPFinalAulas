package com.TrabajoFinal.Aulas.Dtos.usuarioDTO;

import com.TrabajoFinal.Aulas.model.enums.Rol;
import lombok.Data;

import java.util.List;

@Data
public class UsuarioResponseDTO {
    private Integer id;
    private String nombre;
    private String email;
    private Rol rol;
    private List<Integer> materiasIds;
}