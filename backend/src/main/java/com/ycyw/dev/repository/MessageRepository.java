package com.ycyw.dev.repository;

import com.ycyw.dev.model.Message;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MessageRepository extends JpaRepository<Message, Long> {
    // Conversation dans un sens: from -> to, triée chronologiquement
    List<Message> findByFromUser_IdAndToUser_IdOrderByCreatedAtAsc(Integer fromUserId, Integer toUserId);

    // Conversation dans les deux sens: (A->B) OU (B->A), triée chronologiquement
    List<Message> findByFromUser_IdAndToUser_IdOrFromUser_IdAndToUser_IdOrderByCreatedAtAsc(
            Integer fromUserId1, Integer toUserId1, Integer fromUserId2, Integer toUserId2);
}
