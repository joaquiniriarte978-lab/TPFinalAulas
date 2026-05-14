package com.TrabajoFinal.Aulas.Repository;

import com.TrabajoFinal.Aulas.model.enums.Tipo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AulaRepository extends JpaRepository {


    public Optional findAulaById_aula(Integer idaula);

    public List findAulasByCapacidad(int capacidad);

    public List findAulasByNombre(String nombre);

    public List findAulasByTipo(Tipo tipo);

}