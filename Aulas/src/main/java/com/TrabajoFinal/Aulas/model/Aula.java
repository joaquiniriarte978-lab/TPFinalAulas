package com.TrabajoFinal.Aulas.model;

import java.util.Objects;

public class Aula {
private Integer id_aula;
private String nombre;
private int capacidad;
private String tipo;
private String equipamiento;

    public Aula() {
    }

    public Aula(Integer id_aula, String nombre, int capacidad, String tipo, String equipamiento) {
        this.id_aula = id_aula;
        this.nombre = nombre;
        this.capacidad = capacidad;
        this.tipo = tipo;
        this.equipamiento = equipamiento;
    }

    @Override
    public boolean equals(Object o) {
        if (o == null || getClass() != o.getClass()) return false;
        Aula aula = (Aula) o;
        return capacidad == aula.capacidad && Objects.equals(id_aula, aula.id_aula) && Objects.equals(nombre, aula.nombre) && Objects.equals(tipo, aula.tipo) && Objects.equals(equipamiento, aula.equipamiento);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id_aula, nombre, capacidad, tipo, equipamiento);
    }

    @Override
    public String toString() {
        return "Aula{" +
                "id_aula=" + id_aula +
                ", nombre='" + nombre + '\'' +
                ", capacidad=" + capacidad +
                ", tipo='" + tipo + '\'' +
                ", equipamiento='" + equipamiento + '\'' +
                '}';
    }

    public Integer getId_aula() {
        return id_aula;
    }

    public void setId_aula(Integer id_aula) {
        this.id_aula = id_aula;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public int getCapacidad() {
        return capacidad;
    }

    public void setCapacidad(int capacidad) {
        this.capacidad = capacidad;
    }

    public String getTipo() {
        return tipo;
    }

    public void setTipo(String tipo) {
        this.tipo = tipo;
    }

    public String getEquipamiento() {
        return equipamiento;
    }

    public void setEquipamiento(String equipamiento) {
        this.equipamiento = equipamiento;
    }
}
