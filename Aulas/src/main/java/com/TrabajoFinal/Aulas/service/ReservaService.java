package com.TrabajoFinal.Aulas.service;

import com.TrabajoFinal.Aulas.Repository.ReservaRepository;
import com.TrabajoFinal.Aulas.model.Materia;
import com.TrabajoFinal.Aulas.model.Reserva;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ReservaService {
    private final ReservaRepository reservaRepository;

    public Reserva subirReserva(Reserva reserva){
        return reservaRepository.save(reserva);
    }

    public List<Reserva>listarReservas(){
        return reservaRepository.findAll();
    }
    public Reserva listarXId(Integer id){
        return reservaRepository.findById(id)
                .orElseThrow(()->new RuntimeException("Reserva no encontrada"));
    }
    public Reserva modificarReserva(Integer id, Reserva reservaNueva){
        Reserva reservaVieja=listarXId(id);
        reservaVieja.setFecha(reservaNueva.getFecha());
        reservaVieja.setHora_fin(reservaNueva.getHora_fin());
        reservaVieja.setHora_inicio(reservaNueva.getHora_inicio());
        reservaVieja.setId_aula(reservaNueva.getId_aula());
        reservaVieja.setId_profesor(reservaNueva.getId_profesor());
        reservaVieja.setId_materia(reservaNueva.getId_materia());
        return reservaRepository.save(reservaVieja);
    }
    public void eliminarReserva(Integer id){
        reservaRepository.deleteById(id);
    }

}
