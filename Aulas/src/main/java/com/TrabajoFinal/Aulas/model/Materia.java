package com.TrabajoFinal.Aulas.model;

import java.util.Objects;

public class Materia {
    private Integer id_materia;
    private String nombre;
    private boolean requiere_laboratorio;

    public Materia(Integer id_materia, String nombre, boolean requiere_laboratorio) {
        this.id_materia = id_materia;
        this.nombre = nombre;
        this.requiere_laboratorio = requiere_laboratorio;
    }

    public Materia() {
    }



    @Override
    public String toString() {
        return "Materia{" +
                "id_materia=" + id_materia +
                ", nombre='" + nombre + '\'' +
                ", requiere_laboratorio=" + requiere_laboratorio +
                '}';
    }

    @Override
    public boolean equals(Object o) {
        if (o == null || getClass() != o.getClass()) return false;
        Materia materia = (Materia) o;
        return requiere_laboratorio == materia.requiere_laboratorio && Objects.equals(id_materia, materia.id_materia) && Objects.equals(nombre, materia.nombre);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id_materia, nombre, requiere_laboratorio);
    }

    public Integer getId_materia() {
        return id_materia;
    }

    public void setId_materia(Integer id_materia) {
        this.id_materia = id_materia;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public boolean isRequiere_laboratorio() {
        return requiere_laboratorio;
    }

    public void setRequiere_laboratorio(boolean requiere_laboratorio) {
        this.requiere_laboratorio = requiere_laboratorio;
    }
}

