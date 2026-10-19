package com.TrabajoFinal.Aulas.Controller;

import com.TrabajoFinal.Aulas.Repository.*;
import com.TrabajoFinal.Aulas.service.AgendaRules;

import lombok.RequiredArgsConstructor;

import org.springframework.web.bind.annotation.*;

import java.time.*;
import java.util.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/clases")
public class ClasesController {
    private final ClaseFijaRepository clases;
    private final ReservaRepository reservas;
    private final AgendaRules agenda;

    public record Clase(
            Integer comisionId,
            Integer materiaId,
            String materiaNombre,
            String profesorNombre,
            Integer aulaId,
            String aulaNombre,
            LocalDate fecha,
            LocalTime horaInicio,
            LocalTime horaFin,
            String origen) {}

    @GetMapping
    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public List<Clase> listar(
            @RequestParam LocalDate fecha,
            @RequestParam(required = false) Integer materiaId,
            @RequestParam(required = false) Integer aulaId) {
        List<Clase> result = new ArrayList<>();
        for (var cf : clases.findAll())
            if (agenda.ocurre(cf, fecha) && !agenda.liberada(cf, fecha)) {
                var c = cf.getComision();
                result.add(
                        new Clase(
                                c.getId(),
                                c.getMateria().getId(),
                                c.getMateria().getNombre(),
                                c.getProfesor().getUsuario().getNombre(),
                                cf.getAula().getId(),
                                cf.getAula().getNombre(),
                                fecha,
                                cf.getHoraInicio(),
                                cf.getHoraFin(),
                                "CLASE_FIJA"));
            }
        for (var r : reservas.findByFecha(fecha)) {
            var c = r.getComision();
            result.add(
                    new Clase(
                            c.getId(),
                            c.getMateria().getId(),
                            c.getMateria().getNombre(),
                            c.getProfesor().getUsuario().getNombre(),
                            r.getAula().getId(),
                            r.getAula().getNombre(),
                            fecha,
                            r.getHoraInicio(),
                            r.getHoraFin(),
                            "RESERVA"));
        }
        return result.stream()
                .filter(
                        c ->
                                (materiaId == null || materiaId.equals(c.materiaId()))
                                        && (aulaId == null || aulaId.equals(c.aulaId())))
                .sorted(Comparator.comparing(Clase::horaInicio).thenComparing(Clase::materiaNombre))
                .toList();
    }
}
