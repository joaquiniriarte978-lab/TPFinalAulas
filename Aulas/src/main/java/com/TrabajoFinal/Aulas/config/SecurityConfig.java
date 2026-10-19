package com.TrabajoFinal.Aulas.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.access.hierarchicalroles.RoleHierarchy;
import org.springframework.security.access.hierarchicalroles.RoleHierarchyImpl;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import jakarta.servlet.http.HttpServletResponse;

@Configuration
public class SecurityConfig {
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        return http
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/", "/index.html", "/css/**", "/js/**").permitAll()
                        .requestMatchers("/publico").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/recursos").hasAnyRole("ADMIN","USER")
                        .requestMatchers(HttpMethod.DELETE, "/api/recursos/{id}").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.POST, "/api/aulas").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/aulas/{id_aula}").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/aulas/{id_aula}").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/usuarios/me").authenticated()
                        .requestMatchers(HttpMethod.PUT, "/api/usuarios/me").authenticated()
                        .requestMatchers("/api/usuarios", "/api/usuarios/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.POST, "/api/materias").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/materias", "/api/materias/{id_materia}").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/materias/{id_materia}").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/reservas").hasAnyRole("ADMIN", "PROFESOR")
                        .requestMatchers(HttpMethod.GET, "/api/reservas/{id_reserva}").hasAnyRole("ADMIN", "PROFESOR")
                        .requestMatchers(HttpMethod.GET, "/api/avisos").hasAnyRole("ADMIN", "PROFESOR")
                        .requestMatchers(HttpMethod.GET, "/api/avisos/{id_aviso}").hasAnyRole("ADMIN", "PROFESOR")
                        .requestMatchers(HttpMethod.POST, "/api/reservas").hasRole("PROFESOR")
                        .requestMatchers(HttpMethod.PUT, "/api/reservas/{id_reserva}").hasAnyRole("ADMIN", "PROFESOR")
                        .requestMatchers(HttpMethod.DELETE, "/api/reservas/{id_reserva}").hasAnyRole("ADMIN", "PROFESOR")
                        .requestMatchers(HttpMethod.POST, "/api/avisos").hasRole("PROFESOR")
                        .requestMatchers(HttpMethod.PUT, "/api/avisos/{id_aviso}/estado").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/avisos/{id_aviso}").hasRole("PROFESOR")
                        .requestMatchers(HttpMethod.GET, "/api/materias").hasAnyRole("ADMIN", "PROFESOR", "ALUMNO")
                        .requestMatchers(HttpMethod.POST, "/api/comision").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/comision/{id}").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/comision/{id}").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/comision/materia/{id_materia}").hasAnyRole("ADMIN", "PROFESOR", "ALUMNO")
                        .requestMatchers(HttpMethod.GET, "/api/reservas/materia/{id_materia}").hasAnyRole("ADMIN", "PROFESOR", "ALUMNO")
                        .requestMatchers("/swagger-ui/**").permitAll()
                        .requestMatchers("/v3/api-docs/**").permitAll()
                        .requestMatchers("/swagger-ui.html").permitAll()
                        .anyRequest().authenticated()
                )
                .httpBasic(basic -> basic.authenticationEntryPoint((request, response, authException) -> {
                    response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                    response.setContentType("application/json;charset=UTF-8");
                    response.getWriter().write("{\"message\":\"Usuario o contraseña incorrectos.\"}");
                }))
                .exceptionHandling(errors -> errors.accessDeniedHandler((request, response, exception) -> {
                    response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                    response.setContentType("application/json;charset=UTF-8");
                    response.getWriter().write("{\"message\":\"No tenés permiso para realizar esta acción.\"}");
                }))
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public RoleHierarchy roleHierarchy() {
        return RoleHierarchyImpl.fromHierarchy("""
        ROLE_ADMIN > ROLE_PROFESOR
        ROLE_ADMIN > ROLE_ALUMNO
        """);
    }
}
