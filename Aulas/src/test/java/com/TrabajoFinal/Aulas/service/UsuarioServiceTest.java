package com.TrabajoFinal.Aulas.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import com.TrabajoFinal.Aulas.Dtos.usuarioDTO.UsuarioRequestDTO;
import com.TrabajoFinal.Aulas.Repository.*;
import com.TrabajoFinal.Aulas.model.*;
import com.TrabajoFinal.Aulas.model.enums.Rol;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;
import java.util.Optional;

@ExtendWith(MockitoExtension.class)
class UsuarioServiceTest {
    @Mock UsuarioRepository usuarios;
    @Mock PasswordEncoder encoder;
    @Mock ProfesorRepository profesores;
    @Mock MateriaRepository materias;
    @Mock ComisionRepository comisiones;
    @Mock AvisoRepository avisos;
    @Mock AgendaRules agenda;
    @InjectMocks UsuarioService service;
    Usuario usuario;
    Profesor profesor;

    @BeforeEach
    void setup() {
        usuario = new Usuario(7, "Ana", "ana@test.com", "hash-existente", Rol.PROFESOR);
        profesor = new Profesor();
        profesor.setId(11);
        profesor.setUsuario(usuario);
        profesor.setMaterias(List.of(new Materia(2, "Programación", true)));
        when(usuarios.findById(7)).thenReturn(Optional.of(usuario));
    }

    UsuarioRequestDTO request(String rol) {
        UsuarioRequestDTO dto = new UsuarioRequestDTO();
        dto.setNombre("Ana");
        dto.setEmail("ana@test.com");
        dto.setRol(rol);
        return dto;
    }

    @Test
    void cambiarRolNoBorraProfesorComisionesNiAsignaciones() {
        when(usuarios.save(any())).thenAnswer(call -> call.getArgument(0));
        Usuario result = service.modificar(7, request("ALUMNO"));
        assertEquals(Rol.ALUMNO, result.getRol());
        assertEquals("hash-existente", result.getPassword());
        verify(profesores).findByUsuarioId(7);
        verify(profesores, never()).delete(any());
        verifyNoInteractions(materias, comisiones, avisos, encoder);
    }

    @Test
    void volverAProfesorReutilizaSuIdentidadYMaterias() {
        usuario.setRol(Rol.ALUMNO);
        when(usuarios.save(any())).thenAnswer(call -> call.getArgument(0));
        when(profesores.findByUsuarioId(7)).thenReturn(Optional.of(profesor));
        service.modificar(7, request("PROFESOR"));
        assertEquals(11, profesor.getId());
        assertEquals(2, profesor.getMaterias().getFirst().getId());
        verify(profesores).save(same(profesor));
        verifyNoInteractions(materias, comisiones, avisos);
    }

    @Test
    void editarProfesorSinMateriasIdsConservaLasMaterias() {
        when(usuarios.save(any())).thenAnswer(call -> call.getArgument(0));
        when(profesores.findByUsuarioId(7)).thenReturn(Optional.of(profesor));
        service.modificar(7, request("PROFESOR"));
        assertEquals(1, profesor.getMaterias().size());
        verifyNoInteractions(materias);
    }

    @Test
    void bloquearBorradoConMateriasAunqueYaNoSeaProfesor() {
        usuario.setRol(Rol.ALUMNO);
        when(profesores.findByUsuarioId(7)).thenReturn(Optional.of(profesor));
        assertThrows(IllegalArgumentException.class, () -> service.eliminarUsuario(7));
        verify(usuarios, never()).delete(any());
        verify(profesores, never()).delete(any());
    }

    @Test
    void bloquearBorradoConComisionesProtegeTambienReservasYClases() {
        profesor.setMaterias(List.of());
        when(profesores.findByUsuarioId(7)).thenReturn(Optional.of(profesor));
        when(comisiones.existsByProfesorId(11)).thenReturn(true);
        assertThrows(IllegalArgumentException.class, () -> service.eliminarUsuario(7));
        verify(usuarios, never()).delete(any());
        verify(profesores, never()).delete(any());
        verify(comisiones, never()).deleteByProfesorId(anyInt());
    }

    @Test
    void bloquearBorradoConAvisos() {
        when(avisos.existsByUsuarioId(7)).thenReturn(true);
        assertThrows(IllegalArgumentException.class, () -> service.eliminarUsuario(7));
        verify(usuarios, never()).delete(any());
        verifyNoInteractions(profesores);
    }

    @Test
    void eliminarCuentaSinDatosAcademicos() {
        profesor.setMaterias(List.of());
        when(profesores.findByUsuarioId(7)).thenReturn(Optional.of(profesor));
        service.eliminarUsuario(7);
        var ordered = inOrder(profesores, usuarios);
        ordered.verify(profesores).delete(profesor);
        ordered.verify(profesores).flush();
        ordered.verify(usuarios).delete(usuario);
    }
}
