package com.TrabajoFinal.Aulas.model;

import jakarta.persistence.*;
import org.springframework.data.annotation.Id;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Objects;
@Entity
@Table(name = "reserva")
public class Reserva {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id_reserva;
    @ManyToOne
    @JoinColumn(name = "id_profesor")
    private Usuario id_profesor;
    @ManyToOne
    @JoinColumn(name = "id_aula")
    private Aula id_aula;
    @ManyToOne
    @JoinColumn(name = "id_materia")
    private Materia id_materia;
    private LocalDate fecha;
    private LocalTime hora_inicio;
    private LocalTime hora_fin;


    public Reserva() {
    }

    public Reserva(LocalDate fecha, LocalTime hora_fin, LocalTime hora_inicio, Aula id_aula, Materia id_materia, Integer id_reserva,Usuario id_usuario) {
        this.fecha = fecha;
        this.hora_fin = hora_fin;
        this.hora_inicio = hora_inicio;
        this.id_aula = id_aula;
        this.id_materia = id_materia;
        this.id_reserva = id_reserva;
        this.id_profesor = id_usuario;
    }

    @Override
    public boolean equals(Object o) {
        if (o == null || getClass() != o.getClass()) return false;
        Reserva reserva = (Reserva) o;
        return Objects.equals(id_reserva, reserva.id_reserva) && Objects.equals(id_profesor, reserva.id_profesor) && Objects.equals(id_aula, reserva.id_aula) && Objects.equals(id_materia, reserva.id_materia) && Objects.equals(fecha, reserva.fecha);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id_reserva, id_profesor, id_aula, id_materia, fecha);
    }

    public Integer getId_reserva() {
        return id_reserva;
    }

    public void setId_reserva(Integer id_reserva) {
        this.id_reserva = id_reserva;
    }

    public Usuario getId_usuario() {
        return id_profesor;
    }

    public void setId_usuario(Usuario id_usuario) {
        this.id_profesor = id_usuario;
    }

    public Aula getId_aula() {
        return id_aula;
    }

    public void setId_aula(Aula id_aula) {
        this.id_aula = id_aula;
    }

    public Materia getId_materia() {
        return id_materia;
    }

    public void setId_materia(Materia id_materia) {
        this.id_materia = id_materia;
    }

    public LocalDate getFecha() {
        return fecha;
    }

    public void setFecha(LocalDate fecha) {
        this.fecha = fecha;
    }

    public LocalTime getHora_fin() {
        return hora_fin;
    }

    public void setHora_fin(LocalTime hora_fin) {
        this.hora_fin = hora_fin;
    }

    public LocalTime getHora_inicio() {
        return hora_inicio;
    }

    public void setHora_inicio(LocalTime hora_inicio) {
        this.hora_inicio = hora_inicio;
    }

    @Override
    public String toString() {
        return "Reserva{" +
                "id_reserva=" + id_reserva +
                ", id_profesor=" + id_profesor +
                ", id_aula=" + id_aula +
                ", id_materia=" + id_materia +
                ", fecha=" + fecha +
                '}';
    }
}
