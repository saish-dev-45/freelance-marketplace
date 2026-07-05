package com.marketplace.backend.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
public class ApplicationResponseDto {

    private Long id;

    private String status;

    private LocalDateTime appliedAt;

    private Long projectId;

    private String projectTitle;

    private String projectDescription;

    private Double projectBudget;

    private LocalDate projectDeadline;

    private String projectSkills;

    private String projectStatus;

    private String clientName;

    private String clientUsername;

    private Long freelancerId;

    private String freelancerName;

    private String freelancerUsername;
}
