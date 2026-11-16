package com.TrabajoFinal.Aulas.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import com.TrabajoFinal.Aulas.Dtos.avisoDTO.AvisoRequestDTO;
import com.TrabajoFinal.Aulas.Repository.AulaRepository;
import com.TrabajoFinal.Aulas.Repository.AvisoRepository;
import com.TrabajoFinal.Aulas.Repository.ClaseFijaRepository;
import com.TrabajoFinal.Aulas.Repository.ReservaRepository;
import com.TrabajoFinal.Aulas.Repository.UsuarioRepository;
import com.TrabajoFinal.Aulas.model.Aula;
import com.TrabajoFinal.Aulas.model.Aviso;
import com.TrabajoFinal.Aulas.model.Usuario;
import com.TrabajoFinal.Aulas.model.enums.Estado;
import com.TrabajoFinal.Aulas.model.enums.Rol;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;

import java.time.LocalDate;
import java.util.Optional;

@ExtendWith(MockitoExtension.class)
class AvisoServiceTest {
    @Mock AgendaRules agenda;
    @Mock AvisoRepository avisos;
    @Mock AulaRepository aulas;
    @Mock UsuarioRepository usuarios;
    @Mock ReservaRepository reservas;
    @Mock ClaseFijaRepository clasesFijas;
    @InjectMocks AvisoService service;

    Aviso aviso;

    @BeforeEach
    void setup() {
        Usuario autor = new Usuario(5, "Ana", "ana@test.com", "hash", Rol.PROFESOR);
        Aula aula = new Aula(3, "Aula 3", 30, null, null);
        aviso = new Aviso();
        aviso.setId(9);
        aviso.setAula(aula);
        aviso.setUsuario(autor);
        aviso.setMensaje("Proyector roto");
        aviso.setEstado(Estado.PENDIENTE);
        aviso.setFecha(LocalDate.of(2026, 5, 1));
        lenient().when(avisos.findById(9)).thenReturn(Optional.of(aviso));
        lenient().when(avisos.save(any())).thenAnswer(call -> call.getArgument(0));
        lenient().when(agenda.hoy()).thenReturn(LocalDate.of(2026, 5, 10));
    }

    @Test
    void cambiarEstadoActualizaEstadoYFecha() {
        Aviso result = service.cambiarEstado(9, Estado.EN_REVISION);

        assertEquals(Estado.EN_REVISION, result.getEstado());
        assertEquals(LocalDate.of(2026, 5, 10), result.getFechaActualizacion());
    }

    @Test
    void cambiarEstadoAlMismoEstadoSeRechaza() {
        assertThrows(IllegalArgumentException.class, () -> service.cambiarEstado(9, Estado.PENDIENTE));
        verify(avisos, never()).save(any());
    }

    @Test
    void cambiarEstadoDeEnRevisionAResueltoFunciona() {
        aviso.setEstado(Estado.EN_REVISION);

        Aviso result = service.cambiarEstado(9, Estado.RESUELTO);

        assertEquals(Estado.RESUELTO, result.getEstado());
        assertEquals(LocalDate.of(2026, 5, 10), result.getFechaActualizacion());
    }

    @Test
    void noSePuedeSaltearEstadoNiVolverAtras() {
        assertThrows(IllegalArgumentException.class, () -> service.cambiarEstado(9, Estado.RESUELTO));

        aviso.setEstado(Estado.EN_REVISION);
        assertThrows(IllegalArgumentException.class, () -> service.cambiarEstado(9, Estado.PENDIENTE));

        aviso.setEstado(Estado.RESUELTO);
        assertThrows(IllegalArgumentException.class, () -> service.cambiarEstado(9, Estado.EN_REVISION));
        assertThrows(IllegalArgumentException.class, () -> service.cambiarEstado(9, Estado.PENDIENTE));

        verify(avisos, never()).save(any());
    }

    @Test
    void noSePuedeBorrarUnAvisoNoResuelto() {
        assertThrows(IllegalArgumentException.class, () -> service.borrarAviso(9));
        verify(avisos, never()).delete(any());
    }

    @Test
    void sePuedeBorrarUnAvisoResuelto() {
        aviso.setEstado(Estado.RESUELTO);
        service.borrarAviso(9);
        verify(avisos).delete(aviso);
    }

    @Test
    void elAutorNoPuedeEditarUnAvisoQueYaNoEstaPendiente() {
        aviso.setEstado(Estado.EN_REVISION);
        AvisoRequestDTO dto = new AvisoRequestDTO();
        dto.setId_aula(3);
        dto.setMensaje("Editado");

        assertThrows(
                IllegalArgumentException.class,
                () -> service.modificarAvisoProfesor(9, dto, "ana@test.com"));
        verify(avisos, never()).save(any());
    }

    @Test
    void otroUsuarioNoPuedeEditarElAviso() {
        AvisoRequestDTO dto = new AvisoRequestDTO();
        dto.setId_aula(3);
        dto.setMensaje("Editado");

        assertThrows(
                AccessDeniedException.class,
                () -> service.modificarAvisoProfesor(9, dto, "otro@test.com"));
    }
}
