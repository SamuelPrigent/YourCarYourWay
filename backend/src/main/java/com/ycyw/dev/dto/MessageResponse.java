package com.ycyw.dev.dto;

import java.time.Instant;

public class MessageResponse {
    private Long id;
    private Integer fromUserId;
    private Integer toUserId; // nullable
    private String message;
    private Instant createdAt;

    public MessageResponse() {}

    public MessageResponse(Long id, Integer fromUserId, Integer toUserId, String message, Instant createdAt) {
        this.id = id;
        this.fromUserId = fromUserId;
        this.toUserId = toUserId;
        this.message = message;
        this.createdAt = createdAt;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Integer getFromUserId() { return fromUserId; }
    public void setFromUserId(Integer fromUserId) { this.fromUserId = fromUserId; }

    public Integer getToUserId() { return toUserId; }
    public void setToUserId(Integer toUserId) { this.toUserId = toUserId; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
