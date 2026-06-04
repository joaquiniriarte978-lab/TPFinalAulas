package com.TrabajoFinal.Aulas.service;

import com.TrabajoFinal.Aulas.Dtos.reservaDTO.ReservaResponseDTO;
import com.TrabajoFinal.Aulas.Repository.AulaRepository;
import com.TrabajoFinal.Aulas.Repository.MateriaRepository;
import com.TrabajoFinal.Aulas.Repository.ReservaRepository;
import com.TrabajoFinal.Aulas.Repository.UsuarioRepository;
import com.TrabajoFinal.Aulas.model.Aula;
import com.TrabajoFinal.Aulas.model.Materia;
import com.TrabajoFinal.Aulas.model.Reserva;
import com.TrabajoFinal.Aulas.model.Usuario;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ReservaService {
    private final ReservaRepository reservaRepository;
    private final MateriaRepository materiaRepository;
    private final UsuarioRepository usuarioRepository;
    private final AulaRepository aulaRepository;

    public Reserva subirReserva(ReservaResponseDTO dto){
        Reserva reserva=new Reserva();
        Usuario profesor=usuarioRepository.findById(dto.getId_profesor())
                .orElseThrow(()-> new RuntimeException("Usuario no encontrado"));
        Materia materia=materiaRepository.findById(dto.getId_materia()).orElseThrow(()-> new RuntimeException("Materia no encontrada"));
        Aula aula=aulaRepository.findById(dto.getId_aula()).orElseThrow(()-> new RuntimeException("Aula no encontrada"));
        reserva.setMateria(materia);
        reserva.setProfesor(profesor);
        reserva.setAula(aula);
        reserva.setFecha(dto.getFecha());
        reserva.setHoraFin(dto.getHoraFin());
        reserva.setHoraInicio(dto.getHoraInicio());
        return reservaRepository.save(reserva);
    }

    public List<Reserva>listarReservas(){
        return reservaRepository.findAll();
    }
    public Reserva listarXId(Integer id){
        return reservaRepository.findById(id)
                .orElseThrow(()->new RuntimeException("Reserva no encontrada"));
    }
    public Reserva modificarReserva(Integer id, ReservaResponseDTO reservaNueva){
        Usuario profesor=usuarioRepository.findById(reservaNueva.getId_profesor())
                .orElseThrow(()-> new RuntimeException("Usuario no encontrado"));
        Materia materia=materiaRepository.findById(reservaNueva.getId_materia()).orElseThrow(()-> new RuntimeException("Materia no encontrada"));
        Aula aula=aulaRepository.findById(reservaNueva.getId_aula()).orElseThrow(()-> new RuntimeException("Aula no encontrada"));
        Reserva reservaVieja=listarXId(id);
        reservaVieja.setFecha(reservaNueva.getFecha());
        reservaVieja.setHoraFin(reservaNueva.getHoraFin());
        reservaVieja.setHoraInicio(reservaNueva.getHoraInicio());
        reservaVieja.setMateria(materia);
        reservaVieja.setProfesor(profesor);
        reservaVieja.setAula(aula);
        return reservaRepository.save(reservaVieja);
    }
    public void eliminarReserva(Integer id){
        reservaRepository.deleteById(id);
    }

}
