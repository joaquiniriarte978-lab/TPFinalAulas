package com.TrabajoFinal.Aulas.service;

import com.TrabajoFinal.Aulas.Dtos.reservaDTO.ReservaResponseDTO;
import com.TrabajoFinal.Aulas.exceptions.ResourceNotFoundException;
import com.TrabajoFinal.Aulas.model.*;
import com.TrabajoFinal.Aulas.model.enums.DiaSemana;
import com.TrabajoFinal.Aulas.model.enums.EstadoReserva;
import com.TrabajoFinal.Aulas.model.enums.Horario;
import com.TrabajoFinal.Aulas.model.enums.Tipo;
import com.TrabajoFinal.Aulas.Repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.boot.test.context.SpringBootTest;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@SpringBootTest
class ReservaServiceTest {

    @Mock
    private ReservaRepository reservaRepository;

    @Mock
    private ComisionRepository comisionRepository;

    @Mock
    private AulaRepository aulaRepository;

    @Mock
    private ClaseFijaRepository claseFijaRepository;

    @Mock
    private ClaseFijaLiberadaRepository claseFijaLiberadaRepository;

    @InjectMocks
    private ReservaService reservaService;

    private Comision comision;
    private Aula aula;
    private ClaseFija claseFija;
    private LocalDate fecha;
    private LocalTime horaInicio;
    private LocalTime horaFin;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);

        comision = new Comision();
        comision.setId(1);
        comision.setCantAlumnos(20);
        comision.setHorario(Horario.MAÑANA);
        comision.setFechaInicio(LocalDate.now().minusMonths(1));
        comision.setFechaFin(LocalDate.now().plusMonths(1));
        // Mock the profesor and usuario for email
        Profesor profesor = new Profesor();
        Usuario usuario = new Usuario();
        usuario.setEmail("profesor@test.com");
        profesor.setUsuario(usuario);
        comision.setProfesor(profesor);
        // Mock the materia
        Materia materia = new Materia();
        materia.setNombre("Matemáticas");
        materia.setRequiereLaboratorio(false);
        comision.setMateria(materia);

        aula = new Aula();
        aula.setId(1);
        aula.setNombre("Aula 101");
        aula.setCapacidad(30);
        aula.setTipo(Tipo.AULA);

        claseFija = new ClaseFija();
        claseFija.setId(1);
        claseFija.setComision(comision);
        claseFija.setAula(aula);
        claseFija.setDiaSemana(DiaSemana.LUNES);
        claseFija.setHoraInicio(LocalTime.of(8, 0));
        claseFija.setHoraFin(LocalTime.of(10, 0));

        fecha = LocalDate.now(); // Today, assuming today is Monday for simplicity
        horaInicio = LocalTime.of(9, 0);
        horaFin = LocalTime.of(11, 0);
    }

    @Test
    void hacerReserva_whenClaseFijaExistsAndNotLiberated_shouldThrowSpecificException() {
        // Given
        when(comisionRepository.findById(anyInt())).thenReturn(Optional.of(comision));
        when(aulaRepository.findById(anyInt())).thenReturn(Optional.of(aula));
        when(claseFijaRepository.findByComisionId(anyInt())).thenReturn(Optional.of(claseFija));
        when(claseFijaLiberadaRepository.findByClaseFijaIdAndFecha(anyInt(), any()))
                .thenReturn(Optional.empty()); // Not liberated
        // Mock other validations to pass
        when(reservaRepository.existeConflicto(anyInt(), any(LocalDate.class), any(LocalTime.class), any(LocalTime.class)))
                .thenReturn(false);
        when(claseFijaRepository.existeConflictoExcluyendo(anyInt(), any(DiaSemana.class), any(LocalTime.class), any(LocalTime.class), any(Integer.class)))
                .thenReturn(false);

        ReservaResponseDTO dto = new ReservaResponseDTO();
        dto.setId_comision(comision.getId());
        dto.setId_aula(aula.getId());
        dto.setFecha(fecha);
        dto.setHoraInicio(horaInicio);
        dto.setHoraFin(horaFin);
        dto.setLiberarClaseFija(false); // Not liberating

        // When/Then
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            reservaService.hacerReserva(dto, "profesor@test.com", false);
        });
        assertTrue(exception.getMessage().startsWith("CONFIRMACION_LIBERAR_AULA"));
    }

    @Test
    void hacerReserva_whenClaseFijaExistsAndLiberated_shouldSaveReservaAndLiberacion() {
        // Given
        when(comisionRepository.findById(anyInt())).thenReturn(Optional.of(comision));
        when(aulaRepository.findById(anyInt())).thenReturn(Optional.of(aula));
        when(claseFijaRepository.findByComisionId(anyInt())).thenReturn(Optional.of(claseFija));
        when(claseFijaLiberadaRepository.findByClaseFijaIdAndFecha(anyInt(), any()))
                .thenReturn(Optional.empty()); // Not liberated yet, but we will set liberarClaseFija to true
        // Mock other validations to pass
        when(reservaRepository.existeConflicto(anyInt(), any(LocalDate.class), any(LocalTime.class), any(LocalTime.class)))
                .thenReturn(false);
        when(claseFijaRepository.existeConflictoExcluyendo(anyInt(), any(DiaSemana.class), any(LocalTime.class), any(LocalTime.class), any(Integer.class)))
                .thenReturn(false);
        when(reservaRepository.save(any())).thenAnswer(i -> i.getArguments()[0]);

        ReservaResponseDTO dto = new ReservaResponseDTO();
        dto.setId_comision(comision.getId());
        dto.setId_aula(aula.getId());
        dto.setFecha(fecha);
        dto.setHoraInicio(horaInicio);
        dto.setHoraFin(horaFin);
        dto.setLiberarClaseFija(true); // Liberating

        // When
        Reserva reserva = reservaService.hacerReserva(dto, "profesor@test.com", false);

        // Then
        assertNotNull(reserva);
        assertEquals(comision, reserva.getComision());
        assertEquals(aula, reserva.getAula());
        assertEquals(fecha, reserva.getFecha());
        assertEquals(horaInicio, reserva.getHoraInicio());
        assertEquals(horaFin, reserva.getHoraFin());
        assertEquals(EstadoReserva.RESERVADA, reserva.getEstadoReserva());

        // Verify that a ClaseFijaLiberada was saved
        verify(claseFijaLiberadaRepository).save(argThat(argument -> {
            ClaseFijaLiberada liberada = argument;
            return liberada.getClaseFija().equals(claseFija) && liberada.getFecha().equals(fecha);
        }));
    }

    @Test
    void hacerReserva_whenClaseFijaAlreadyLiberated_shouldAllowReservationWithoutNewLiberacion() {
        // Given
        when(comisionRepository.findById(anyInt())).thenReturn(Optional.of(comision));
        when(aulaRepository.findById(anyInt())).thenReturn(Optional.of(aula));
        when(claseFijaRepository.findByComisionId(anyInt())).thenReturn(Optional.of(claseFija));
        when(claseFijaLiberadaRepository.findByClaseFijaIdAndFecha(anyInt(), any()))
                .thenReturn(Optional.of(new ClaseFijaLiberada())); // Already liberated
        // Mock other validations to pass
        when(reservaRepository.existeConflicto(anyInt(), any(LocalDate.class), any(LocalTime.class), any(LocalTime.class)))
                .thenReturn(false);
        when(claseFijaRepository.existeConflictoExcluyendo(anyInt(), any(DiaSemana.class), any(LocalTime.class), any(LocalTime.class), any(Integer.class)))
                .thenReturn(false);
        when(reservaRepository.save(any())).thenAnswer(i -> i.getArguments()[0]);

        ReservaResponseDTO dto = new ReservaResponseDTO();
        dto.setId_comision(comision.getId());
        dto.setId_aula(aula.getId());
        dto.setFecha(fecha);
        dto.setHoraInicio(horaInicio);
        dto.setHoraFin(horaFin);
        dto.setLiberarClaseFija(false); // Not liberating again, but it's already liberated

        // When
        Reserva reserva = reservaService.hacerReserva(dto, "profesor@test.com", false);

        // Then
        assertNotNull(reserva);
        // Verify that no new ClaseFijaLiberada was saved (since it's already liberated)
        verify(claseFijaLiberadaRepository, never()).save(any());
    }
}