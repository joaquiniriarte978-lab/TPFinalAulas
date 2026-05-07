package com.TrabajoFinal.Aulas.model;

import jakarta.persistence.*;
import jdk.jfr.Enabled;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.Objects;
@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "aviso")
public class Aviso {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id_aviso;
@ManyToOne
@JoinColumn(name = "id_aula")
    private Aula id_aula;
    @ManyToOne
    @JoinColumn(name = "id_usuario")
    private Usuario id_usuario;
    private String mensaje;
    @Enumerated(EnumType.STRING)
    private Estado estado;
    private LocalDate fecha;


}
