package com.TrabajoFinal.Aulas.model;

import java.util.Objects;

public class ProfesorMateria {
    private Integer id_usuario;
    private Integer id_materia;

    public ProfesorMateria(Integer id_usuario, Integer id_materia) {
        this.id_usuario = id_usuario;
        this.id_materia = id_materia;
    }

    @Override
    public String toString() {
        return "ProfesorMateria{" +
                "id_usuario=" + id_usuario +
                ", id_materia=" + id_materia +
                '}';
    }

    @Override
    public boolean equals(Object o) {
        if (o == null || getClass() != o.getClass()) return false;
        ProfesorMateria that = (ProfesorMateria) o;
        return Objects.equals(id_usuario, that.id_usuario) && Objects.equals(id_materia, that.id_materia);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id_usuario, id_materia);
    }

    public Integer getId_usuario() {
        return id_usuario;
    }

    public void setId_usuario(Integer id_usuario) {
        this.id_usuario = id_usuario;
    }

    public Integer getId_materia() {
        return id_materia;
    }

    public void setId_materia(Integer id_materia) {
        this.id_materia = id_materia;
    }
}
