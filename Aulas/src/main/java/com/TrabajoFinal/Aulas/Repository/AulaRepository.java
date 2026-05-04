package com.TrabajoFinal.Aulas.Repository;

import com.TrabajoFinal.Aulas.model.Aula;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
@Repository
public interface AulaRepository extends JpaRepository<Aula,Integer> {



    public List<Aula> findAll();

    public List<Aula> findAulaById_aula(Integer idaula);

    public void saveAula(Aula aula);

    public void deleteAulaById(Integer idaula);

    public void updateAulaById(Integer idaula, Aula aula);

}
