package com.TrabajoFinal.Aulas.config;

import org.springframework.context.annotation.*;

import java.time.*;

@Configuration
public class TimeConfig {
    @Bean
    public Clock clock() {
        return Clock.system(ZoneId.of("America/Argentina/Buenos_Aires"));
    }
}
