package com.TrabajoFinal.Aulas.service;

import com.TrabajoFinal.Aulas.Dtos.avisoDTO.AvisoResponseDTO;
import com.TrabajoFinal.Aulas.Repository.AulaRepository;
import com.TrabajoFinal.Aulas.Repository.AvisoRepository;
import com.TrabajoFinal.Aulas.Repository.UsuarioRepository;
import com.TrabajoFinal.Aulas.model.Aula;
import com.TrabajoFinal.Aulas.model.Aviso;
import com.TrabajoFinal.Aulas.model.Usuario;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

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

    public Aviso avisoXid(Integer id){
        return avisoRepository.findById(id)
                .orElseThrow(()-> new RuntimeException());
    }

    public Aviso guardarAviso(Aviso aviso){
        return avisoRepository.save(aviso);
    }

    public void borrarAviso(Integer id){
        Aviso borrado = avisoXid(id);
        avisoRepository.delete(borrado);
    }

    public Aviso modificarAviso(Integer id, AvisoResponseDTO nuevo){
        Aviso modificado= avisoXid(id);
        Aula aula= aulaRepository.findById(nuevo.getId_aula())
                .orElseThrow(()-> new RuntimeException());

        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(()-> new RuntimeException());

        modificado.setId_aula(aula);
        modificado.setId_usuario(usuario);
        modificado.setFecha(nuevo.getFecha());
        modificado.setMensaje(nuevo.getMensaje());
        modificado.setEstado(nuevo.getEstado());

        return avisoRepository.save(modificado);
    }
}

