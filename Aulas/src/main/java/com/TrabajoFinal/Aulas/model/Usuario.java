package com.TrabajoFinal.Aulas.model;

import com.TrabajoFinal.Aulas.model.enums.Rol;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "usuario")
public class Usuario {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id_usuario;
    @Column(nullable=false)
    private String nombre;
    @Column(unique = true, nullable=false)
    private String email;
    @Column(nullable=false)
    private String password;
    @Enumerated(EnumType.STRING)
    private Rol rol;


}
