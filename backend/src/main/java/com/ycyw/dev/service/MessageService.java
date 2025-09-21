package com.ycyw.dev.service;

import com.ycyw.dev.dto.MessageRequest;
import com.ycyw.dev.dto.MessageResponse;

import java.util.List;

public interface MessageService {
    MessageResponse createMessage(MessageRequest request);

    /**
     * Récupère l'historique des messages entre deux users.
     * 
     * @param fromUserId     expéditeur
     * @param toUserId       destinataire
     * @param bothDirections si true, renvoie (A->B) et (B->A) triés
     *                       chronologiquement
     */
    List<MessageResponse> getConversation(Integer fromUserId, Integer toUserId);
}
