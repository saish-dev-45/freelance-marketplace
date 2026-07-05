package com.marketplace.backend.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class FreelancerLeaderboardEntryDto {

    private Integer rank;

    private Long freelancerId;

    private String freelancerName;

    private String freelancerUsername;

    private Double averageRating;

    private Long totalReviews;
}
