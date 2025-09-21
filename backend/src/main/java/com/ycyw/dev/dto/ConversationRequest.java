package com.ycyw.dev.dto;

import jakarta.validation.constraints.NotNull;

public class ConversationRequest {
    @NotNull
    private Integer fromUserId;
    @NotNull
    private Integer toUserId;

    public Integer getFromUserId() {
        return fromUserId;
    }

    public void setFromUserId(Integer fromUserId) {
        this.fromUserId = fromUserId;
    }

    public Integer getToUserId() {
        return toUserId;
    }

    public void setToUserId(Integer toUserId) {
        this.toUserId = toUserId;
    }
}
