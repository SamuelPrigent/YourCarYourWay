package com.ycyw.dev.service.impl;

import com.ycyw.dev.dto.MessageRequest;
import com.ycyw.dev.dto.MessageResponse;
import com.ycyw.dev.model.Message;
import com.ycyw.dev.model.User;
import com.ycyw.dev.repository.MessageRepository;
import com.ycyw.dev.repository.UserRepository;
import com.ycyw.dev.service.MessageService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class MessageServiceImpl implements MessageService {

    private final MessageRepository messageRepository;
    private final UserRepository userRepository;

    public MessageServiceImpl(MessageRepository messageRepository, UserRepository userRepository) {
        this.messageRepository = messageRepository;
        this.userRepository = userRepository;
    }

    @Override
    @Transactional
    public MessageResponse createMessage(MessageRequest req) {
        // Vérifier que les deux utilisateurs existent
        Optional<User> fromOpt = userRepository.findById(req.getUserId());
        if (fromOpt.isEmpty()) {
            throw new IllegalArgumentException(
                    "User expéditeur (" + req.getUserId() + ") inexistant. Créez d'abord l'utilisateur.");
        }
        Optional<User> toOpt = userRepository.findById(req.getToUserId());
        if (toOpt.isEmpty()) {
            throw new IllegalArgumentException(
                    "User destinataire (" + req.getToUserId() + ") inexistant. Créez d'abord l'utilisateur.");
        }

        Message m = new Message();
        m.setFromUser(fromOpt.get());
        m.setToUser(toOpt.get());
        m.setContent(req.getMessage());
        Message saved = messageRepository.save(m);

        return new MessageResponse(
                saved.getId(),
                saved.getFromUser() != null ? saved.getFromUser().getId() : null,
                saved.getToUser() != null ? saved.getToUser().getId() : null,
                saved.getContent(),
                saved.getCreatedAt());
    }

    @Override
    public List<MessageResponse> getConversation(Integer fromUserId, Integer toUserId, boolean bothDirections) {
        if (fromUserId == null || toUserId == null) {
            throw new IllegalArgumentException("fromUserId et toUserId sont requis");
        }

        List<Message> messages;
        if (bothDirections) {
            messages = messageRepository
                    .findByFromUser_IdAndToUser_IdOrFromUser_IdAndToUser_IdOrderByCreatedAtAsc(
                            fromUserId, toUserId, toUserId, fromUserId);
        } else {
            messages = messageRepository
                    .findByFromUser_IdAndToUser_IdOrderByCreatedAtAsc(fromUserId, toUserId);
        }

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
