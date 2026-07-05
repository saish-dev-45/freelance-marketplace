package com.marketplace.backend.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class NotificationResponseDto {

    private Long id;

    private String message;

    private String type;

    private boolean read;

    private LocalDateTime createdAt;

    private Long applicationId;

    private Long projectId;
}
