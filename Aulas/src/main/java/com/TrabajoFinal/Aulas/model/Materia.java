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
@Table(name="materia")
public class Materia {
    @Id
    @GeneratedValue(strategy= GenerationType.IDENTITY)
    private Integer id_materia;
    @Column(nullable=false)
    private String nombre;
    
    private boolean requiere_laboratorio=false;


}

