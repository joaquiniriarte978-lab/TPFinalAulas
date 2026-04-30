package com.TrabajoFinal.Aulas.model;

import java.time.LocalDate;
import java.util.Objects;

public class Aviso {
    private Integer id_aviso;
    private Integer id_aula;
    private Integer id_usuario;
    private String mensaje;
    private Estado estado;
    private LocalDate fecha;

    public Aviso() {
    }

    public Aviso(Integer id_aviso, Integer id_aula, Integer id_usuario, String mensaje, Estado estado, LocalDate fecha) {
        this.id_aviso = id_aviso;
        this.id_aula = id_aula;
        this.id_usuario = id_usuario;
        this.mensaje = mensaje;
        this.estado = estado;
        this.fecha = fecha;
    }

    @Override
    public boolean equals(Object o) {
        if (o == null || getClass() != o.getClass()) return false;
        Aviso aviso = (Aviso) o;
        return Objects.equals(id_aviso, aviso.id_aviso) && Objects.equals(id_aula, aviso.id_aula) && Objects.equals(id_usuario, aviso.id_usuario) && Objects.equals(mensaje, aviso.mensaje) && Objects.equals(estado, aviso.estado) && Objects.equals(fecha, aviso.fecha);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id_aviso, id_aula, id_usuario, mensaje, estado, fecha);
    }

    public Integer getId_aviso() {
        return id_aviso;
    }

    public void setId_aviso(Integer id_aviso) {
        this.id_aviso = id_aviso;
    }

    public Integer getId_aula() {
        return id_aula;
    }

    public void setId_aula(Integer id_aula) {
        this.id_aula = id_aula;
    }

    public Integer getId_usuario() {
        return id_usuario;
    }

    public void setId_usuario(Integer id_usuario) {
        this.id_usuario = id_usuario;
    }

    public String getMensaje() {
        return mensaje;
    }

    public void setMensaje(String mensaje) {
        this.mensaje = mensaje;
    }

    public Estado getEstado() {
        return estado;
    }

    public void setEstado(Estado estado) {
        this.estado = estado;
    }

    public LocalDate getFecha() {
        return fecha;
    }

    public void setFecha(LocalDate fecha) {
        this.fecha = fecha;
    }

    @Override
    public String toString() {
        return "Aviso{" +
                "id_aviso=" + id_aviso +
                ", id_aula=" + id_aula +
                ", id_usuario=" + id_usuario +
                ", mensaje='" + mensaje + '\'' +
                ", estado='" + estado + '\'' +
                ", fecha=" + fecha +
                '}';
    }
}
