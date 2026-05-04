package com.TrabajoFinal.Aulas.Repository;

import com.TrabajoFinal.Aulas.model.Aula;
import com.TrabajoFinal.Aulas.model.Aviso;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AvisoRepository extends JpaRepository<Aviso,Integer> {

    public List<Aviso> findAll();

    public List<Aviso> findAvisoById_aviso(Integer idaviso);

    public void saveAviso(Aviso aviso);

    public void deleteAvisoById(Integer idaviso);

    public void updateAvisoById(Integer idaviso, Aviso aviso);


}
