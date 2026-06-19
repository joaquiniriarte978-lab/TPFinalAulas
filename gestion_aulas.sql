-- ============================================================
-- Script de base de datos: gestion_aulas
-- Generado desde entidades JPA del proyecto TPFinalAulas
-- Base: gestion_aulas | Motor: MySQL
-- ============================================================

CREATE DATABASE IF NOT EXISTS gestion_aulas
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE gestion_aulas;

-- -----------------------------------------------------------
-- Tabla: usuario
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS usuario (
    id          INT          AUTO_INCREMENT PRIMARY KEY,
    nombre      VARCHAR(20)  NOT NULL,
    email       VARCHAR(255) NOT NULL UNIQUE,
    contrasenia VARCHAR(255) NOT NULL,
    rol         VARCHAR(20)  -- 'PROFESOR' | 'ALUMNO' | 'ADMIN'
);

-- -----------------------------------------------------------
-- Tabla: aula
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS aula (
    id           INT         AUTO_INCREMENT PRIMARY KEY,
    nombre       VARCHAR(20) NOT NULL,
    capacidad    INT         NOT NULL,
    tipo         VARCHAR(30),  -- 'AULA' | 'LABORATORIO' | 'SUM' | 'LABORATORIO_TEXTIL' | 'LABORATORIO_IDIOMAS'
    equipamiento VARCHAR(255)
);

-- -----------------------------------------------------------
-- Tabla: materia
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS materia (
    id                   INT         AUTO_INCREMENT PRIMARY KEY,
    nombre               VARCHAR(20) NOT NULL,
    requiere_laboratorio BIT         NOT NULL DEFAULT 0
);

-- -----------------------------------------------------------
-- Tabla: profesor
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS profesor (
    id         INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT UNIQUE,
    CONSTRAINT fk_profesor_usuario FOREIGN KEY (usuario_id) REFERENCES usuario(id)
);

-- -----------------------------------------------------------
-- Tabla: profesor_materias  (relación ManyToMany Profesor <-> Materia)
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS profesor_materias (
    profesor_id INT NOT NULL,
    materias_id INT NOT NULL,
    PRIMARY KEY (profesor_id, materias_id),
    CONSTRAINT fk_pm_profesor FOREIGN KEY (profesor_id) REFERENCES profesor(id),
    CONSTRAINT fk_pm_materia  FOREIGN KEY (materias_id) REFERENCES materia(id)
);

-- -----------------------------------------------------------
-- Tabla: comision
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS comision (
    id_comision  INT AUTO_INCREMENT PRIMARY KEY,
    id_profesor  INT,
    id_materia   INT,
    cant_alumnos INT         NOT NULL,
    horario      VARCHAR(10) NOT NULL,  -- 'MAÑANA' | 'TARDE' | 'NOCHE'
    fecha_inicio DATE        NOT NULL,
    fecha_fin    DATE        NOT NULL,
    CONSTRAINT fk_comision_profesor FOREIGN KEY (id_profesor) REFERENCES profesor(id),
    CONSTRAINT fk_comision_materia  FOREIGN KEY (id_materia)  REFERENCES materia(id)
);

-- -----------------------------------------------------------
-- Tabla: clase_fija
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS clase_fija (
    id          INT  AUTO_INCREMENT PRIMARY KEY,
    id_comision INT  UNIQUE,
    id_aula     INT,
    dia_semana  VARCHAR(15),  -- 'LUNES' | 'MARTES' | 'MIERCOLES' | 'JUEVES' | 'VIERNES' | 'SABADO'
    hora_inicio TIME,
    hora_fin    TIME,
    CONSTRAINT fk_cf_comision FOREIGN KEY (id_comision) REFERENCES comision(id_comision),
    CONSTRAINT fk_cf_aula     FOREIGN KEY (id_aula)     REFERENCES aula(id)
);

-- -----------------------------------------------------------
-- Tabla: reserva
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS reserva (
    id            INT AUTO_INCREMENT PRIMARY KEY,
    comision      INT,
    id_aula       INT,
    fecha         DATE,
    hora_inicio   TIME,
    hora_fin      TIME,
    estado_reserva VARCHAR(15),  -- 'RESERVADA' | 'CANCELADA'
    CONSTRAINT fk_reserva_comision FOREIGN KEY (comision) REFERENCES comision(id_comision),
    CONSTRAINT fk_reserva_aula     FOREIGN KEY (id_aula)  REFERENCES aula(id)
);

-- -----------------------------------------------------------
-- Tabla: aviso
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS aviso (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    id_aula     INT,
    id_usuario  INT,
    mensaje     VARCHAR(255),
    estado      VARCHAR(15),  -- 'PENDIENTE' | 'RESUELTO' | 'EN_REVISION'
    fecha       DATE,
    CONSTRAINT fk_aviso_aula    FOREIGN KEY (id_aula)    REFERENCES aula(id),
    CONSTRAINT fk_aviso_usuario FOREIGN KEY (id_usuario) REFERENCES usuario(id)
);

-- -----------------------------------------------------------
-- Datos de ejemplo (opcional - descomenta para poblar)
-- -----------------------------------------------------------

-- INSERT INTO usuario (nombre, email, contrasenia, rol) VALUES
--     ('Admin',    'admin@utn.edu.ar',    '$2a$10$...hash...', 'ADMIN'),
--     ('Juan',     'juan@utn.edu.ar',     '$2a$10$...hash...', 'PROFESOR'),
--     ('Maria',    'maria@utn.edu.ar',    '$2a$10$...hash...', 'ALUMNO');