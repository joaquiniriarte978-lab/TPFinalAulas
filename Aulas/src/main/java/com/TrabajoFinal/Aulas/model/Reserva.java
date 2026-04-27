package com.TrabajoFinal.Aulas.model;

import java.time.LocalDate;
import java.util.Objects;

public class Reserva {
    private Integer id_reserva;
    private Integer id_usuario;
    private Integer id_aula;
    private Integer id_turno;
    private Integer id_materia;
    private LocalDate fecha;


    public Reserva() {
    }

    public Reserva(Integer id_reserva, Integer id_usuario, Integer id_aula, Integer id_turno, Integer id_materia, LocalDate fecha) {
        this.id_reserva = id_reserva;
        this.id_usuario = id_usuario;
        this.id_aula = id_aula;
        this.id_turno = id_turno;
        this.id_materia = id_materia;
        this.fecha = fecha;
    }

    @Override
    public boolean equals(Object o) {
        if (o == null || getClass() != o.getClass()) return false;
        Reserva reserva = (Reserva) o;
        return Objects.equals(id_reserva, reserva.id_reserva) && Objects.equals(id_usuario, reserva.id_usuario) && Objects.equals(id_aula, reserva.id_aula) && Objects.equals(id_turno, reserva.id_turno) && Objects.equals(id_materia, reserva.id_materia) && Objects.equals(fecha, reserva.fecha);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id_reserva, id_usuario, id_aula, id_turno, id_materia, fecha);
    }

    public Integer getId_reserva() {
        return id_reserva;
    }

    public void setId_reserva(Integer id_reserva) {
        this.id_reserva = id_reserva;
    }

    public Integer getId_usuario() {
        return id_usuario;
    }

    public void setId_usuario(Integer id_usuario) {
        this.id_usuario = id_usuario;
    }

    public Integer getId_aula() {
        return id_aula;
    }

    public void setId_aula(Integer id_aula) {
        this.id_aula = id_aula;
    }

    public Integer getId_turno() {
        return id_turno;
    }

    public void setId_turno(Integer id_turno) {
        this.id_turno = id_turno;
    }

    public Integer getId_materia() {
        return id_materia;
    }

    public void setId_materia(Integer id_materia) {
        this.id_materia = id_materia;
    }

    public LocalDate getFecha() {
        return fecha;
    }

    public void setFecha(LocalDate fecha) {
        this.fecha = fecha;
    }

    @Override
    public String toString() {
        return "Reserva{" +
                "id_reserva=" + id_reserva +
                ", id_usuario=" + id_usuario +
                ", id_aula=" + id_aula +
                ", id_turno=" + id_turno +
                ", id_materia=" + id_materia +
                ", fecha=" + fecha +
                '}';
    }
}
