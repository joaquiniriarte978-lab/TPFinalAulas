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
        reservaVieja.setHoraFin(reservaNueva.getHoraFin());
        reservaVieja.setHoraInicio(reservaNueva.getHoraInicio());
        reservaVieja.setAula(reservaNueva.getAula());
        reservaVieja.setProfesor(reservaNueva.getProfesor());
        reservaVieja.setMateria(reservaNueva.getMateria());
        return reservaRepository.save(reservaVieja);
    }
    public void eliminarReserva(Integer id){
        reservaRepository.deleteById(id);
    }

}
