package com.marketplace.backend.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class ProjectRequestDto {

    private String title;

    private String description;

    private Double budget;

    private LocalDate deadline;

    private String skills;

    private String status;
}