package com.TrabajoFinal.Aulas.Repository;

import com.TrabajoFinal.Aulas.model.Aula;
import com.TrabajoFinal.Aulas.model.Aviso;
import com.TrabajoFinal.Aulas.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface AvisoRepository extends JpaRepository {

    public Optional findAvisoById_aviso(Integer idaviso);

    public List findAvisoById_aula(Aula idaula);

    public List findAvisoById_usuario(Usuario idusuario);

    public List findAvisosByFecha(LocalDate fecha);


}