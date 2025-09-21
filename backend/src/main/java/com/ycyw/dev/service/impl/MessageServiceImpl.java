package com.ycyw.dev.service.impl;

import com.ycyw.dev.dto.MessageRequest;
import com.ycyw.dev.dto.MessageResponse;
import com.ycyw.dev.model.Message;
import com.ycyw.dev.model.User;
import com.ycyw.dev.repository.MessageRepository;
import com.ycyw.dev.repository.UserRepository;
import com.ycyw.dev.service.MessageService;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class MessageServiceImpl implements MessageService {

    private final MessageRepository messageRepository;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;

    public MessageServiceImpl(MessageRepository messageRepository, UserRepository userRepository,
            SimpMessagingTemplate messagingTemplate) {
        this.messageRepository = messageRepository;
        this.userRepository = userRepository;
        this.messagingTemplate = messagingTemplate;
    }

    @Override
    @Transactional
    public MessageResponse createMessage(MessageRequest req) {
        // Vérifier que l'auteur du message existe
        Optional<User> fromOpt = userRepository.findById(req.getUserId());
        if (fromOpt.isEmpty()) {
            throw new IllegalArgumentException(
                    "User expéditeur (" + req.getUserId() + ") inexistant.");
        }
        // Vérifie que le destinataire existe
        Optional<User> toOpt = userRepository.findById(req.getToUserId());
        if (toOpt.isEmpty()) {
            throw new IllegalArgumentException(
                    "User destinataire (" + req.getToUserId() + ") inexistant.");
        }

        // création de l'objet msg
        Message msg = new Message();
        msg.setFromUser(fromOpt.get());
        msg.setToUser(toOpt.get());
        msg.setContent(req.getMessage());
        Message saved = messageRepository.save(msg);

        // ============================================
        // Emit WebSocket events to both participants
        // Payload object = message for Websocket
        var payload = new com.ycyw.dev.dto.MessageResponse(
                saved.getId(),
                saved.getFromUser() != null ? saved.getFromUser().getId() : null,
                saved.getToUser() != null ? saved.getToUser().getId() : null,
                saved.getContent(),
                saved.getCreatedAt());
        // Canal commun de conversation: /topic/conversation/{a}-{b} (a=min, b=max)
        if (saved.getFromUser() != null && saved.getToUser() != null) {
            int fromId = saved.getFromUser().getId();
            int toId = saved.getToUser().getId();
            int a = Math.min(fromId, toId);
            int b = Math.max(fromId, toId);
            messagingTemplate.convertAndSend("/topic/conversation/" + a + "-" + b, payload);
        }

        return new MessageResponse(
                saved.getId(),
                saved.getFromUser() != null ? saved.getFromUser().getId() : null,
                saved.getToUser() != null ? saved.getToUser().getId() : null,
                saved.getContent(),
                saved.getCreatedAt());
    }

    @Override
    public List<MessageResponse> getConversation(Integer fromUserId, Integer toUserId) {
        if (fromUserId == null || toUserId == null) {
            throw new IllegalArgumentException("fromUserId et toUserId sont requis");
        }

        List<Message> messages;
        messages = messageRepository
                .findByFromUser_IdAndToUser_IdOrFromUser_IdAndToUser_IdOrderByCreatedAtAsc(
                        fromUserId, toUserId, toUserId, fromUserId);

        return messages.stream()
                .map(m -> new MessageResponse(
                        m.getId(),
                        m.getFromUser() != null ? m.getFromUser().getId() : null,
                        m.getToUser() != null ? m.getToUser().getId() : null,
                        m.getContent(),
                        m.getCreatedAt()))
                .collect(Collectors.toList());
    }
}
