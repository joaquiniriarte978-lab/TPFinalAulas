package com.TrabajoFinal.Aulas.Repository;

import com.TrabajoFinal.Aulas.model.Aviso;
import com.TrabajoFinal.Aulas.model.enums.Estado;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AvisoRepository extends JpaRepository<Aviso,Integer> {

    boolean existsByAulaId(Integer aulaId);
    boolean existsByUsuarioId(Integer usuarioId);

    List<Aviso> findByEstado(Estado estado);
}
