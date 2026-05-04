package com.TrabajoFinal.Aulas.model;

import jakarta.persistence.*;

import java.util.Objects;
@Entity
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

    public ProfesorMateria(Usuario id_profesor, Materia id_materia) {
        this.id_profesor = id_profesor;
        this.id_materia = id_materia;
    }

    @Override
    public String toString() {
        return "ProfesorMateria{" +
                "id_profesor_materia=" + id_profesor_materia +
                "id_profesor=" + id_profesor +
                ", id_materia=" + id_materia +
                '}';
    }

    @Override
    public boolean equals(Object o) {
        if (o == null || getClass() != o.getClass()) return false;
        ProfesorMateria that = (ProfesorMateria) o;
        return Objects.equals(id_profesor, that.id_profesor) && Objects.equals(id_materia, that.id_materia);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id_profesor, id_materia);
    }

    public Usuario getId_profesor() {
        return id_profesor;
    }

    public void setId_usuario(Usuario id_usuario) {
        this.id_profesor = id_usuario;
    }

    public Materia getId_materia() {
        return id_materia;
    }

    public void setId_materia(Materia id_materia) {
        this.id_materia = id_materia;
    }
}
