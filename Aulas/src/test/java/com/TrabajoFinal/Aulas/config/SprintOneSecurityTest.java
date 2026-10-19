package com.TrabajoFinal.Aulas.config;

import com.TrabajoFinal.Aulas.Controller.*;
import com.TrabajoFinal.Aulas.Repository.ProfesorRepository;
import com.TrabajoFinal.Aulas.model.Usuario;
import com.TrabajoFinal.Aulas.model.enums.Rol;
import com.TrabajoFinal.Aulas.service.*;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(controllers = {UsuarioController.class, AulaController.class, MateriaController.class})
@Import(SecurityConfig.class)
class SprintOneSecurityTest {
    @Autowired MockMvc mvc;
    @MockitoBean UsuarioService usuarios;
    @MockitoBean ProfesorRepository profesores;
    @MockitoBean AulaService aulas;
    @MockitoBean MateriaService materias;
    @MockitoBean CustomUserDetailsService userDetails;

    @Test void sinCredencialesNoHayAcceso() throws Exception {
        mvc.perform(get("/api/usuarios/me")).andExpect(status().isUnauthorized());
        mvc.perform(get("/api/aulas")).andExpect(status().isUnauthorized());
    }

    @ParameterizedTest @ValueSource(strings = {"ADMIN", "PROFESOR", "ALUMNO"})
    void losTresRolesPuedenConsultarAulasMateriasYSuIdentidad(String rol) throws Exception {
        mvc.perform(get("/api/aulas").with(user("test").roles(rol))).andExpect(status().isOk());
        mvc.perform(get("/api/materias").with(user("test").roles(rol))).andExpect(status().isOk());
        mvc.perform(get("/api/usuarios/me").with(user("test").roles(rol)))
                .andExpect(status().isOk()).andExpect(jsonPath("$.rol").value(rol));
    }

    @ParameterizedTest @ValueSource(strings = {"PROFESOR", "ALUMNO"})
    void lecturaDeUsuariosYEscriturasSonSoloDeAdmin(String rol) throws Exception {
        for (String path : new String[]{"/api/usuarios", "/api/usuarios/7"}) {
            mvc.perform(get(path).with(user("test").roles(rol))).andExpect(status().isForbidden());
        }
        for (String path : new String[]{"/api/aulas", "/api/materias", "/api/usuarios"}) {
            mvc.perform(post(path).with(user("test").roles(rol)).contentType("application/json").content("{}"))
                    .andExpect(status().isForbidden());
            mvc.perform(put(path + "/7").with(user("test").roles(rol)).contentType("application/json").content("{}"))
                    .andExpect(status().isForbidden());
            mvc.perform(delete(path + "/7").with(user("test").roles(rol))).andExpect(status().isForbidden());
        }
        verifyNoInteractions(usuarios, aulas, materias);
    }

    @Test void administradorPuedeListarUsuarios() throws Exception {
        mvc.perform(get("/api/usuarios").with(user("admin").roles("ADMIN"))).andExpect(status().isOk());
        verify(usuarios).listarTodos();
    }

    @Test void perfilPropioNoPermiteElevarPrivilegios() throws Exception {
        Usuario alumno = new Usuario(7, "Ana", "ana@test.com", "hash", Rol.ALUMNO);
        mvc.perform(put("/api/usuarios/me").with(user(alumno)).contentType("application/json")
                .content("{\"nombre\":\"Ana\",\"email\":\"ana@test.com\",\"rol\":\"ADMIN\"}"))
                .andExpect(status().isBadRequest());
        verify(usuarios, never()).modificar(anyInt(), any());
    }

    @Test void administradorNoPuedeBorrarseNiCambiarSuPropioRol() throws Exception {
        Usuario admin = new Usuario(7, "Ana", "ana@test.com", "hash", Rol.ADMIN);
        when(usuarios.buscarPorId(7)).thenReturn(admin);
        mvc.perform(delete("/api/usuarios/7").with(user(admin))).andExpect(status().isBadRequest());
        mvc.perform(put("/api/usuarios/7").with(user(admin)).contentType("application/json")
                .content("{\"nombre\":\"Ana\",\"email\":\"ana@test.com\",\"rol\":\"ALUMNO\"}"))
                .andExpect(status().isBadRequest());
        verify(usuarios, never()).eliminarUsuario(anyInt()); verify(usuarios, never()).modificar(anyInt(), any());
    }

    @Test void erroresDeIntegridadNoExponenSql() throws Exception {
        doThrow(new org.springframework.dao.DataIntegrityViolationException("SQL secret"))
                .when(materias).borrar(7);
        mvc.perform(delete("/api/materias/7").with(user("admin").roles("ADMIN")))
                .andExpect(status().isConflict()).andExpect(content().string(org.hamcrest.Matchers.not(org.hamcrest.Matchers.containsString("secret"))));
    }
}
