package com.TrabajoFinal.Aulas.Dtos.usuarioDTO;

import jakarta.validation.constraints.*;

import lombok.Data;

@Data
public class PerfilRequestDTO {
    @NotBlank(message = "El nombre es obligatorio")
    @Size(max = 20, message = "El nombre debe tener un máximo de 20 caracteres")
    private String nombre;

    @NotBlank(message = "El email es obligatorio")
    @Email(message = "El email no es válido")
    @Pattern(
            regexp = "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,6}$",
            message = "Ingresá un correo válido con su dominio")
    private String email;

    @Pattern(
            regexp = "^$|^(?=.*[A-Z]).{8,}$",
            message = "La contraseña debe tener al menos 8 caracteres y una mayúscula")
    private String password;

    // Se rechazan explícitamente los campos de permisos, incluso si llegan desde otro cliente.
    @Null(message = "El perfil no permite cambiar el rol")
    private String rol;

    @Null(message = "El perfil no permite cambiar materias")
    private java.util.List<Integer> materiasIds;
}
