package com.ycyw.dev.configuration;

import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@Configuration
@EnableJpaAuditing
public class JpaAuditingConfiguration {
    // Cette classe vide active l'audit JPA qui permet d'utiliser
    // les annotations @CreatedDate et @UpdateTimestamp
}
