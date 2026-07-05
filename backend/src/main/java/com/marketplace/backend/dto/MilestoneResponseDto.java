package com.marketplace.backend.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class MilestoneResponseDto {

    private Long id;

    private String title;

    private Boolean completed;

    private Long applicationId;
}