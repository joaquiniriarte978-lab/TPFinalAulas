package com.TrabajoFinal.Aulas.Dtos.usuarioDTO;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.List;

@Data
public class UsuarioRequestDTO {

    @NotBlank(message = "El nombre es obligatorio")
    @Size(max = 20, message = "El nombre debe tener un máximo de 20 caracteres")
    private String nombre;

    @NotBlank(message = "El email es obligatorio")
    @Email(message = "Email inválido")
    @Pattern(regexp = "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,6}$", message = "Debe ingresar un correo válido con su dominio (ej: @gmail.com, @hotmail.com)")
    private String email;


    // Permite vacío (edición sin cambiar contraseña) o mínimo 8 chars con al menos una mayúscula
    @Pattern(regexp = "^$|^(?=.*[A-Z]).{8,}$", message = "La contraseña debe tener al menos 8 caracteres y una mayúscula")
    private String password;

    @NotBlank(message = "El rol es obligatorio")
    private String rol;
    private List<Integer> materiasIds;
}