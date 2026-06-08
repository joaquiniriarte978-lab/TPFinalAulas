package com.TrabajoFinal.Aulas.service;

import com.TrabajoFinal.Aulas.Dtos.reservaDTO.ReservaResponseDTO;
import com.TrabajoFinal.Aulas.Repository.*;
import com.TrabajoFinal.Aulas.exceptions.ResourceNotFoundException;
import com.TrabajoFinal.Aulas.model.*;
import com.TrabajoFinal.Aulas.model.enums.EstadoReserva;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ReservaService {
    private final ReservaRepository reservaRepository;
    private final ComisionRepository comisionRepository;
    private final AulaRepository aulaRepository;

    public Reserva hacerReserva(ReservaResponseDTO dto){
        Reserva reserva=new Reserva();
        Comision comision=comisionRepository.findById(dto.getId_comision())
                .orElseThrow(()-> new ResourceNotFoundException("Comision", dto.getId_comision()));
        Aula aula=aulaRepository.findById(dto.getId_aula())
                .orElseThrow(()-> new ResourceNotFoundException("Aula", dto.getId_aula()));
       reserva.setComision(comision);
        reserva.setAula(aula);
        reserva.setFecha(dto.getFecha());
        reserva.setHoraFin(dto.getHoraFin());
        reserva.setHoraInicio(dto.getHoraInicio());
        reserva.setEstadoReserva(EstadoReserva.RESERVADA);
        return reservaRepository.save(reserva);
    }

    public List<Reserva>listarReservas(){
        return reservaRepository.findAll();
    }
    public Reserva listarXId(Integer id){
        return reservaRepository.findById(id)
                .orElseThrow(()->new ResourceNotFoundException("Reserva", id));
    }
    public Reserva modificarReserva(Integer id, ReservaResponseDTO reservaNueva){
        Comision comision=comisionRepository.findById(reservaNueva.getId_comision())
                .orElseThrow(()-> new ResourceNotFoundException("Comision", reservaNueva.getId_comision()));
        Aula aula=aulaRepository.findById(reservaNueva.getId_aula()).orElseThrow(()-> new ResourceNotFoundException("Aula", reservaNueva.getId_aula()));
        Reserva reservaVieja=listarXId(id);
        reservaVieja.setFecha(reservaNueva.getFecha());
        reservaVieja.setHoraFin(reservaNueva.getHoraFin());
        reservaVieja.setHoraInicio(reservaNueva.getHoraInicio());
        reservaVieja.setComision(comision);
        reservaVieja.setAula(aula);
        return reservaRepository.save(reservaVieja);
    }
    public Reserva cancelarReserva(Integer id){
        Reserva reserva=listarXId(id);
        if(reserva.getEstadoReserva().equals(EstadoReserva.RESERVADA)){
            reserva.setEstadoReserva(EstadoReserva.CANCELADA);
            return  reservaRepository.save(reserva);
        }else {
            throw new RuntimeException("La reserva no esta reservada");
        }
    }
    public void eliminarReserva(Integer id){
        reservaRepository.deleteById(id);
    }

}
