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
@Table(name="profesor_materia")
public class ProfesorMateria {
    @Id
    @GeneratedValue(strategy= GenerationType.IDENTITY)
    @Column(name = "id_profesor_materia")
    private Integer id;
    @ManyToOne
    @JoinColumn(name = "id_profesor")
    private Usuario profesor;
    @ManyToOne
    @JoinColumn(name = "id_materia")
    private Materia materia;


}
