package com.marketplace.backend.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class ReviewResponseDto {

    private Long id;

    private Integer rating;

    private String feedback;

    private LocalDateTime reviewedAt;

    private String clientName;

    private String freelancerName;

    private Long applicationId;
}