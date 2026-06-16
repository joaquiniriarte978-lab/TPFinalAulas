package com.TrabajoFinal.Aulas.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
@Table(name="materia")
public class Materia {
    @Id
    @GeneratedValue(strategy= GenerationType.IDENTITY)
    private Integer id;

    @NotBlank(message = "El nombre no puede estar vacío")
    @Size(max = 20, message = "El nombre debe tener un máximo de 20 caracteres")
    @Column(nullable=false)
    private String nombre;

    @Column(name = "requiere_laboratorio")
    private boolean requiereLaboratorio=false;
}
