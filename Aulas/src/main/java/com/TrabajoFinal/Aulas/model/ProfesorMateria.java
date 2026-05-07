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
@Table(name="profesorMateria")
public class ProfesorMateria {
    @Id
    @GeneratedValue(strategy= GenerationType.IDENTITY)
    private Integer id_profesor_materia;
    @ManyToOne
    @JoinColumn(name = "id_profesor")
    private Usuario id_profesor;
    @ManyToOne
    @JoinColumn(name = "id_materia")
    private Materia id_materia;


}
