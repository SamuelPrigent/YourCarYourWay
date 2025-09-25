package com.ycyw.dev.configuration;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.lang.NonNull;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void registerStompEndpoints(@NonNull StompEndpointRegistry registry) {
        // Endpoint STOMP pour clients (Angular, etc.)
        // Exemple de connexion côté front: ws(s)://<host>:8080/ws
        registry.addEndpoint("/ws").setAllowedOriginPatterns("*").withSockJS();
        registry.addEndpoint("/ws").setAllowedOriginPatterns("*"); // sans SockJS
    }

    @Override
    public void configureMessageBroker(@NonNull MessageBrokerRegistry registry) {
        // Le broker simple en mémoire pour diffuser vers /topic/**
        registry.enableSimpleBroker("/topic");
        // Préfixe des destinations applicatives si on reçoit des messages côté serveur
        // (non utilisé ici): /app
        registry.setApplicationDestinationPrefixes("/app");
    }
}
