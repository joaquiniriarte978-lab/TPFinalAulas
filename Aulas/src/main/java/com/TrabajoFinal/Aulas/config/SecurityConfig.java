package com.TrabajoFinal.Aulas.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.access.hierarchicalroles.RoleHierarchy;
import org.springframework.security.access.hierarchicalroles.RoleHierarchyImpl;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;
import org.springframework.security.web.SecurityFilterChain;

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
                        .requestMatchers(HttpMethod.POST, "/api/usuarios").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/usuarios/{id_aula}").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/usuarios/{id_aula}").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.POST, "/api/materias").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/materias").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/materias/{id_materia}").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/reservas").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/reservas/{id_reserva}").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/avisos").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/avisos/{id_aviso}").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.POST, "/api/reservas").hasRole("PROFESOR")
                        .requestMatchers(HttpMethod.POST, "/api/avisos").hasRole("PROFESOR")
                        .requestMatchers(HttpMethod.GET, "/api/materias").hasRole("ALUMNO")
                        .requestMatchers(HttpMethod.POST, "/api/comision").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/comision/{id}").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/comision/{id}").hasRole("ADMIN")

                         .anyRequest().authenticated()
                )
                .httpBasic(Customizer.withDefaults())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .build();

    }
    @Bean
    public UserDetailsService userDetailsService(PasswordEncoder encoder) {
        UserDetails alumno = User.withUsername("alumno")
                .password(encoder.encode("1234"))
                .roles("ALUMNO")
                .build();

        UserDetails profesor = User.withUsername("profesor")
                .password(encoder.encode("1234"))
                .roles("PROFESOR")
                .build();

        UserDetails admin = User.withUsername("admin")
                .password(encoder.encode("1234"))
                .roles("ADMIN")
                .build();
        return new InMemoryUserDetailsManager(alumno, profesor, admin);
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
