package com.ycyw.dev.controller;

import com.ycyw.dev.dto.MessageRequest;
import com.ycyw.dev.dto.MessageResponse;
import com.ycyw.dev.service.MessageService;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api")
public class MessageController {

    private final MessageService messageService;

    public MessageController(MessageService messageService) {
        this.messageService = messageService;
    }

    // get message conversation
    @GetMapping("/messages/conversation")
    public List<MessageResponse> getConversation(
            @RequestParam Integer fromUserId,
            @RequestParam Integer toUserId,
            @RequestParam(name = "both", defaultValue = "true") boolean bothDirections) {
        return messageService.getConversation(fromUserId, toUserId, bothDirections);
    }

    // Send message to someone
    @PostMapping("/message")
    @Transactional
    public ResponseEntity<?> postMessage(@Valid @RequestBody MessageRequest req) {
        try {
            MessageResponse resp = messageService.createMessage(req);
            return ResponseEntity.created(URI.create("/api/message/" + resp.getId())).body(resp);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
