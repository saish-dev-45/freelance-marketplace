package com.marketplace.backend.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ReviewRequestDto {

    private Integer rating;

    private String feedback;
}