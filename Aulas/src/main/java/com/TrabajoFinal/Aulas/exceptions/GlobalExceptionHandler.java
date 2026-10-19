package com.TrabajoFinal.Aulas.exceptions;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(org.springframework.security.access.AccessDeniedException.class)
    public ResponseEntity<String> manejarPermisos(
            org.springframework.security.access.AccessDeniedException ex) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body("No tenés permiso para realizar esta acción.");
    }

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<String> manejarNoEncontrado(ResourceNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ex.getMessage());
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<String> manejarIntegridad(DataIntegrityViolationException ex) {
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(
                        "No se pudo completar la operación: existen datos relacionados o un valor"
                            + " duplicado. Los datos se conservaron.");
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<String> manejarFormato(HttpMessageNotReadableException ex) {
        return ResponseEntity.badRequest()
                .body("El formato de los datos no es válido. Revisá los campos enviados.");
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<String> manejarValidaciones(MethodArgumentNotValidException ex) {
        String errorMsg =
                ex.getBindingResult().getFieldErrors().stream()
                        .map(err -> err.getDefaultMessage())
                        .findFirst()
                        .orElse("Error de validación en los datos ingresados");

        return new ResponseEntity<>(errorMsg, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<String> manejarRuntime(RuntimeException ex) {
        return new ResponseEntity<>(ex.getMessage(), HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<String> manejarGeneral(Exception ex) {
        return new ResponseEntity<>("Ocurrió un error", HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
