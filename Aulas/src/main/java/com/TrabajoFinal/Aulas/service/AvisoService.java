package com.TrabajoFinal.Aulas.service;

import com.TrabajoFinal.Aulas.Dtos.avisoDTO.AvisoRequestDTO;
import com.TrabajoFinal.Aulas.Dtos.avisoDTO.AvisoResponseDTO;
import com.TrabajoFinal.Aulas.Repository.AulaRepository;
import com.TrabajoFinal.Aulas.Repository.AvisoRepository;
import com.TrabajoFinal.Aulas.Repository.ClaseFijaRepository;
import com.TrabajoFinal.Aulas.Repository.ReservaRepository;
import com.TrabajoFinal.Aulas.Repository.UsuarioRepository;
import com.TrabajoFinal.Aulas.exceptions.ResourceNotFoundException;
import com.TrabajoFinal.Aulas.model.Aula;
import com.TrabajoFinal.Aulas.model.Aviso;
import com.TrabajoFinal.Aulas.model.Usuario;
import com.TrabajoFinal.Aulas.model.enums.Estado;
import com.TrabajoFinal.Aulas.model.enums.Rol;

import lombok.RequiredArgsConstructor;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AvisoService {
    private final AgendaRules agenda;
    private final AvisoRepository avisoRepository;
    private final AulaRepository aulaRepository;
    private final UsuarioRepository usuarioRepository;
    private final ReservaRepository reservaRepository;
    private final ClaseFijaRepository claseFijaRepository;

    public List<Aviso> listarAvisos() {
        return avisoRepository.findAll();
    }

    public List<Aviso> listarAvisosPendientes() {
        return avisoRepository.findByEstado(Estado.PENDIENTE);
    }

    public Aviso avisoXid(Integer id) {
        return avisoRepository
                .findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Aviso", id));
    }

    @Transactional
    public Aviso guardarAviso(AvisoRequestDTO avisoDto, String emailUsuario) {
        Aviso aviso = new Aviso();

        Aula aula =
                aulaRepository
                        .findById(avisoDto.getId_aula())
                        .orElseThrow(
                                () -> new ResourceNotFoundException("Aula", avisoDto.getId_aula()));

        Usuario usuario =
                usuarioRepository
                        .findByEmail(emailUsuario)
                        .orElseThrow(() -> new ResourceNotFoundException("Usuario", 0));

        if (usuario.getRol() == Rol.PROFESOR) {
            validarAccesoAula(emailUsuario, avisoDto.getId_aula());
        }

        aviso.setAula(aula);
        aviso.setUsuario(usuario);
        aviso.setMensaje(avisoDto.getMensaje());
        aviso.setFecha(agenda.hoy());
        aviso.setEstado(Estado.PENDIENTE);

        return avisoRepository.save(aviso);
    }

    public void borrarAviso(Integer id) {
        Aviso borrado = avisoXid(id);

        if (!borrado.getEstado().equals(Estado.RESUELTO)) {
            throw new RuntimeException("Solo se pueden eliminar avisos resueltos.");
        }

        avisoRepository.delete(borrado);
    }

    public Aviso cambiarEstado(Integer id, Estado estado) {
        Aviso aviso = avisoXid(id);
        aviso.setEstado(estado);
        return avisoRepository.save(aviso);
    }

    @Transactional
    public Aviso modificarAvisoProfesor(Integer id, AvisoRequestDTO dto, String emailUsuario) {
        Aviso aviso = avisoXid(id);

        if (!aviso.getUsuario().getEmail().equals(emailUsuario)) {
            throw new AccessDeniedException("Solo podés modificar tus propios avisos.");
        }

        if (aviso.getUsuario().getRol() == Rol.PROFESOR) {
            validarAccesoAula(emailUsuario, dto.getId_aula());
        }

        Aula aula =
                aulaRepository
                        .findById(dto.getId_aula())
                        .orElseThrow(() -> new ResourceNotFoundException("Aula", dto.getId_aula()));

        aviso.setAula(aula);
        aviso.setMensaje(dto.getMensaje());

        return avisoRepository.save(aviso);
    }

    private void validarAccesoAula(String emailProfesor, Integer idAula) {
        LocalDate hoy = agenda.hoy();
        LocalTime ahora = agenda.ahora();

        boolean tuvoReserva =
                reservaRepository.existeReservaTerminadaEnAula(emailProfesor, idAula, hoy, ahora);
        if (tuvoReserva) return;

        boolean tieneClaseFija =
                claseFijaRepository.tieneClaseFijaActiva(emailProfesor, idAula, hoy);
        if (tieneClaseFija) return;

        throw new RuntimeException(
                "Solo podés hacer un aviso de un aula en la que tengas clase fija asignada o en la"
                        + " que hayas tenido una reserva.");
    }

    public List<Aula> aulasHabilitadas(String email, boolean admin) {
        return aulaRepository.findAll().stream()
                .filter(
                        a ->
                                admin
                                        || reservaRepository.existeReservaTerminadaEnAula(
                                                email, a.getId(), agenda.hoy(), agenda.ahora())
                                        || claseFijaRepository.tieneClaseFijaActiva(
                                                email, a.getId(), agenda.hoy()))
                .toList();
    }

    public AvisoResponseDTO dto(Aviso a, String email) {
        var d = new AvisoResponseDTO();
        d.setId(a.getId());
        d.setIdAula(a.getAula().getId());
        d.setIdUsuario(a.getUsuario().getId());
        d.setAulaNombre(a.getAula().getNombre());
        d.setAutorNombre(a.getUsuario().getNombre());
        d.setPropio(a.getUsuario().getEmail().equals(email));
        d.setMensaje(a.getMensaje());
        d.setFecha(a.getFecha());
        d.setEstado(a.getEstado());
        return d;
    }
}
