package com.TrabajoFinal.Aulas.Dtos.profesorDTO;

import java.util.List;

public record ProfesorResponseDTO(
        Integer id, Integer usuarioId, String nombre, String email, List<Integer> materiasIds) {}
