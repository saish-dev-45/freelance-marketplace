package com.marketplace.backend.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class FreelancerProfileRequestDto {

    private String professionalTitle;

    private String currentCollege;

    private String currentCompany;

    private String shortBio;

    private String experienceLevel;

    private String expertise;

    private String notableProjects;
}
