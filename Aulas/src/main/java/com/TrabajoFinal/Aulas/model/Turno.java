package com.TrabajoFinal.Aulas.model;

import java.time.LocalTime;
import java.util.Objects;

public class Turno {
    private Integer id_turno;
    private LocalTime horaInicio;
    private LocalTime horaFin;

    public Turno() {
    }

    public Turno(Integer id_turno, LocalTime horaInicio, LocalTime horaFin) {
        this.id_turno = id_turno;
        this.horaInicio = horaInicio;
        this.horaFin = horaFin;
    }

    @Override
    public boolean equals(Object o) {
        if (o == null || getClass() != o.getClass()) return false;
        Turno turno = (Turno) o;
        return Objects.equals(id_turno, turno.id_turno) && Objects.equals(horaInicio, turno.horaInicio) && Objects.equals(horaFin, turno.horaFin);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id_turno, horaInicio, horaFin);
    }

    public Integer getId_turno() {
        return id_turno;
    }

    public void setId_turno(Integer id_turno) {
        this.id_turno = id_turno;
    }

    public LocalTime getHoraInicio() {
        return horaInicio;
    }

    public void setHoraInicio(LocalTime horaInicio) {
        this.horaInicio = horaInicio;
    }

    public LocalTime getHoraFin() {
        return horaFin;
    }

    public void setHoraFin(LocalTime horaFin) {
        this.horaFin = horaFin;
    }

    @Override
    public String toString() {
        return "Turno{" +
                "id_turno=" + id_turno +
                ", horaInicio=" + horaInicio +
                ", horaFin=" + horaFin +
                '}';
    }
}
