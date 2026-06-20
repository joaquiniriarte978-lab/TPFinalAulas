package com.TrabajoFinal.Aulas;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class    AulasApplication {
	public static void main(String[] args) {
		SpringApplication.run(AulasApplication.class, args);
	}

}
