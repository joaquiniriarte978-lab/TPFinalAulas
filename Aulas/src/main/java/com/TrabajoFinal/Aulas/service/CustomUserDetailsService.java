package com.TrabajoFinal.Aulas.service;

import com.TrabajoFinal.Aulas.Repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {
    private final UsuarioRepository usuarioRepository;

    private final PasswordEncoder passwordEncoder;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {

        if ("admin".equals(username)) {
            return User.withUsername("admin")
                    .password(passwordEncoder.encode("Usuario1"))
                    .roles("ADMIN")
                    .build();
        }
        if ("profesor".equals(username)) {
            return User.withUsername("profesor")
                    .password(passwordEncoder.encode("Usuario1"))
                    .roles("PROFESOR")
                    .build();
        }
        if ("alumno".equals(username)) {
            return User.withUsername("alumno")
                    .password(passwordEncoder.encode("Usuario1"))
                    .roles("ALUMNO")
                    .build();
        }


        return usuarioRepository.findByEmail(username)
                .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado: " + username));
    }

}
