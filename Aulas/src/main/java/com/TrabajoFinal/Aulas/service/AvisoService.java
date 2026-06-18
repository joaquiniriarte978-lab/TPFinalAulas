package com.TrabajoFinal.Aulas.service;

import com.TrabajoFinal.Aulas.Dtos.avisoDTO.AvisoRequestDTO;
import com.TrabajoFinal.Aulas.Dtos.avisoDTO.AvisoResponseDTO;
import com.TrabajoFinal.Aulas.Repository.AulaRepository;
import com.TrabajoFinal.Aulas.Repository.AvisoRepository;
import com.TrabajoFinal.Aulas.Repository.UsuarioRepository;
import com.TrabajoFinal.Aulas.exceptions.ResourceNotFoundException;
import com.TrabajoFinal.Aulas.model.Aula;
import com.TrabajoFinal.Aulas.model.Aviso;
import com.TrabajoFinal.Aulas.model.Usuario;
import com.TrabajoFinal.Aulas.model.enums.Estado;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AvisoService {
    private final AvisoRepository avisoRepository;
    private final AulaRepository aulaRepository;
    private final UsuarioRepository usuarioRepository;

    public List<Aviso> listarAvisos(){
        return avisoRepository.findAll();
    }

    public List<Aviso> listarAvisosPendientes(){
        return avisoRepository.findByEstado(Estado.PENDIENTE);
    }

    public Aviso avisoXid(Integer id){
        return avisoRepository.findById(id)
                .orElseThrow(()->new ResourceNotFoundException("Aviso", id));
    }

    public Aviso guardarAviso(AvisoRequestDTO avisoDto, String emailUsuario) {
        Aviso aviso = new Aviso();

        Aula aula = aulaRepository.findById(avisoDto.getId_aula())
                .orElseThrow(() -> new ResourceNotFoundException("Aula", avisoDto.getId_aula()));

        Usuario usuario = usuarioRepository.findByEmail(emailUsuario)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario", 0));

        aviso.setAula(aula);
        aviso.setUsuario(usuario);
        aviso.setMensaje(avisoDto.getMensaje());
        aviso.setFecha(LocalDate.now());
        aviso.setEstado(Estado.PENDIENTE);

        return avisoRepository.save(aviso);
    }

    public void borrarAviso(Integer id){
        Aviso borrado = avisoXid(id);
        avisoRepository.delete(borrado);
    }

    public Aviso cambiarEstado(Integer id, Estado estado) {
        Aviso aviso = avisoXid(id);
        aviso.setEstado(estado);
        return avisoRepository.save(aviso);
    }
    public Aviso modificarAvisoProfesor(Integer id, AvisoRequestDTO dto, String emailUsuario) {
        Aviso aviso = avisoXid(id);

        if (!aviso.getUsuario().getEmail().equals(emailUsuario)) {
            throw new RuntimeException("Solo podés modificar tus propios avisos.");
        }

        Aula aula = aulaRepository.findById(dto.getId_aula())
                .orElseThrow(() -> new ResourceNotFoundException("Aula", dto.getId_aula()));

        aviso.setAula(aula);
        aviso.setMensaje(dto.getMensaje());

        return avisoRepository.save(aviso);
    }
}

