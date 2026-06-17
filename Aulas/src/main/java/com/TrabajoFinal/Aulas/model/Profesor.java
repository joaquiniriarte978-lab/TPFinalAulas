package com.TrabajoFinal.Aulas.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Objects;
@Data
@AllArgsConstructor
@NoArgsConstructor

@Entity
@Table (name = "profesor")
public class Profesor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(unique = true)
    private Usuario usuario;

    @JsonIgnore
    @ManyToMany
    private List<Materia> materias;

    @JsonIgnore
    @OneToMany(mappedBy = "profesor")
    private List<Comision> comisiones;

}