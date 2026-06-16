package com.TrabajoFinal.Aulas.model;

import com.TrabajoFinal.Aulas.model.enums.Tipo;
import jakarta.persistence.*;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
@Table(name="aula")
public class Aula {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @NotBlank(message = "El nombre no puede estar vacío")
    @Size(max = 20, message = "El nombre debe tener un máximo de 20 caracteres")
    @Column(nullable = false)
    private String nombre;

    @Min(value = 1, message = "La capacidad mínima debe ser 1")
    @Max(value = 100, message = "La capacidad máxima permitida es 100")
    @Column(nullable = false)
    private int capacidad;

    @Enumerated(EnumType.STRING)
    private Tipo tipo;

    private String equipamiento;
}