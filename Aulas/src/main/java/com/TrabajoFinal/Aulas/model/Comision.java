package com.TrabajoFinal.Aulas.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
@Table(name="comision")
public class Comision {
    @Id
    @GeneratedValue(strategy= GenerationType.IDENTITY)
    @Column(name = "id_comision")
    private Integer id;
    @ManyToOne
    @JoinColumn(name = "id_profesor")
    private Usuario profesor;
    @ManyToOne
    @JoinColumn(name = "id_materia")
    private Materia materia;
    @Column(name = "cant_alumnos")
    private Integer cantAlumnos;




}
