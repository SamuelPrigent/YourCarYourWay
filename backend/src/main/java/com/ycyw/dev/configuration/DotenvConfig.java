package com.ycyw.dev.configuration;

import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.support.PropertySourcesPlaceholderConfigurer;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.MapPropertySource;
import org.springframework.core.env.MutablePropertySources;

import jakarta.annotation.PostConstruct;
import java.io.File;
import java.util.HashMap;
import java.util.Map;
import java.util.Properties;

@Configuration
public class DotenvConfig {

    private final ConfigurableEnvironment environment;

    // Variables pour stocker les valeurs chargées depuis .env
    private static final Properties envProperties = new Properties();

    static {
        // Code exécuté avant TOUT le reste de l'application
        try {
            // System.out.println("Chargement initial des variables d'environnement...");
            File envFile = new File("backend/.env");
            if (!envFile.exists()) {
                envFile = new File("./.env");
            }

            if (envFile.exists()) {
                // System.out.println("Fichier .env trouvé à: " + envFile.getAbsolutePath());
                Dotenv dotenv = Dotenv.configure().directory(envFile.getParent()).load();

                // Stocker les valeurs pour les utiliser plus tard
                dotenv.entries().forEach(e -> {
                    envProperties.setProperty(e.getKey(), e.getValue());
                    // Définir aussi comme propriété système pour un accès immédiat
                    System.setProperty(e.getKey(), e.getValue());
                    // System.out.println("Variable définie: " + e.getKey() + "=" + e.getValue());
                });
            } else {
                System.out.println("ATTENTION: Fichier .env non trouvé!");
            }
        } catch (Exception e) {
            System.err.println("Erreur lors du chargement initial de .env: " + e.getMessage());
        }
    }

    public DotenvConfig(ConfigurableEnvironment environment) {
        this.environment = environment;
        // Charger les variables dans l'environnement Spring
        addToEnvironment();
    }

    /**
     * Ce bean est créé AVANT que Spring ne commence à résoudre les placeholders
     */
    @Bean
    public static PropertySourcesPlaceholderConfigurer propertySourcesPlaceholderConfigurer() {
        PropertySourcesPlaceholderConfigurer configurer = new PropertySourcesPlaceholderConfigurer();
        configurer.setProperties(envProperties);
        // Donner une priorité élevée à nos propriétés
        configurer.setLocalOverride(true);
        return configurer;
    }

    /**
     * Bean Dotenv pour l'injection de dépendance
     */
    @Bean
    public Dotenv dotenv() {
        File envFile = new File("backend/.env");
        if (!envFile.exists()) {
            envFile = new File("./.env");
        }

        return Dotenv.configure().directory(envFile.getParent()).load();
    }

    @PostConstruct
    public void init() {
        // S'assurer que les variables sont bien dans l'environnement
        addToEnvironment();
    }

    private void addToEnvironment() {
        try {
            // Ajouter les propriétés à l'environnement Spring
            Map<String, Object> envMap = new HashMap<>();
            for (String key : envProperties.stringPropertyNames()) {
                envMap.put(key, envProperties.getProperty(key));
            }

            if (!envMap.isEmpty()) {
                MutablePropertySources propertySources = environment.getPropertySources();
                MapPropertySource propertySource = new MapPropertySource("dotenvProperties", envMap);

                if (!propertySources.contains("dotenvProperties")) {
                    propertySources.addFirst(propertySource);
                }
            }
        } catch (Exception e) {
            System.err.println("Erreur lors de l'ajout des variables à l'environnement: " + e.getMessage());
        }
    }
}