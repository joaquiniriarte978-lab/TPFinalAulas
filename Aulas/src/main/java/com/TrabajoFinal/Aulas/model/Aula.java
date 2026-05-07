package com.TrabajoFinal.Aulas.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Objects;
@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
@Table(name="aula")
public class Aula {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id_aula;
    @Column(nullable = false)
    private String nombre;
    @Column(nullable = false)
    private int capacidad;

    private Tipo tipo;
    private String equipamiento;


}