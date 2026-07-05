package com.marketplace.backend.service;

import com.marketplace.backend.dto.FreelancerLeaderboardEntryDto;
import com.marketplace.backend.dto.ReviewRequestDto;
import com.marketplace.backend.dto.ReviewResponseDto;
import com.marketplace.backend.entity.Application;
import com.marketplace.backend.entity.Review;
import com.marketplace.backend.entity.User;
import com.marketplace.backend.repository.ApplicationRepository;
import com.marketplace.backend.repository.ReviewRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class ReviewService {

    @Autowired
    private ReviewRepository reviewRepository;

    @Autowired
    private ApplicationRepository applicationRepository;

    public ReviewResponseDto giveReview(
            Long applicationId,
            ReviewRequestDto request,
            User client
    ) {

        Application application = applicationRepository
                .findById(applicationId)
                .orElseThrow(() ->
                        new RuntimeException("Application not found"));

        if (!application.getProject()
                .getClient()
                .getId()
                .equals(client.getId())) {

            throw new RuntimeException(
                    "Only the project client can give reviews"
            );
        }

        if (!application.getStatus()
                .equalsIgnoreCase("ACCEPTED")) {

            throw new RuntimeException(
                    "Review can only be given for accepted applications"
            );
        }

        if (!application.getProject()
                .getStatus()
                .equalsIgnoreCase("COMPLETED")) {

            throw new RuntimeException(
                    "Review can only be given after project completion"
            );
        }

        if (reviewRepository.existsByApplicationId(applicationId)) {

            throw new RuntimeException(
                    "Review already submitted"
            );
        }

        if (request.getRating() < 1 ||
                request.getRating() > 5) {

            throw new RuntimeException(
                    "Rating must be between 1 and 5"
            );
        }

        Review review = new Review();

        review.setRating(request.getRating());

        review.setFeedback(request.getFeedback());

        review.setReviewedAt(LocalDateTime.now());

        review.setApplication(application);

        review.setClient(client);

        review.setFreelancer(
                application.getFreelancer()
        );

        Review savedReview =
                reviewRepository.save(review);

        return convertToDto(savedReview);
    }

    public ReviewResponseDto getReviewForApplication(
            Long applicationId,
            User client
    ) {

        Application application = applicationRepository
                .findById(applicationId)
                .orElseThrow(() ->
                        new RuntimeException("Application not found"));

        if (!application.getProject()
                .getClient()
                .getId()
                .equals(client.getId())) {

            throw new RuntimeException(
                    "Only the project client can view this review"
            );
        }

        return reviewRepository.findByApplicationId(applicationId)
                .map(this::convertToDto)
                .orElse(null);
    }

    public List<FreelancerLeaderboardEntryDto> getLeaderboard() {

        List<Review> allReviews = reviewRepository.findAll();

        if (allReviews.isEmpty()) {
            return new ArrayList<>();
        }

        Map<Long, List<Review>> reviewsByFreelancer = allReviews.stream()
                .collect(Collectors.groupingBy(
                        review -> review.getFreelancer().getId()
                ));

        List<FreelancerLeaderboardEntryDto> leaderboard = reviewsByFreelancer
                .values()
                .stream()
                .map(reviews -> {
                    User freelancer = reviews.get(0).getFreelancer();

                    double averageRating = reviews.stream()
                            .mapToInt(Review::getRating)
                            .average()
                            .orElse(0);

                    FreelancerLeaderboardEntryDto dto =
                            new FreelancerLeaderboardEntryDto();

                    dto.setFreelancerId(freelancer.getId());
                    dto.setFreelancerName(freelancer.getName());
                    dto.setFreelancerUsername(freelancer.getUsername());
                    dto.setAverageRating(
                            Math.round(averageRating * 10.0) / 10.0
                    );
                    dto.setTotalReviews((long) reviews.size());

                    return dto;
                })
                .sorted(
                        Comparator
                                .comparing(
                                        FreelancerLeaderboardEntryDto::getAverageRating
                                )
                                .reversed()
                                .thenComparing(
                                        FreelancerLeaderboardEntryDto::getTotalReviews
                                )
                                .reversed()
                )
                .collect(Collectors.toList());

        for (int index = 0; index < leaderboard.size(); index++) {
            leaderboard.get(index).setRank(index + 1);
        }

        return leaderboard;
    }

    public List<ReviewResponseDto> getFreelancerReviews(
            User freelancer
    ) {

        return reviewRepository.findByFreelancer(freelancer)
                .stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    private ReviewResponseDto convertToDto(
            Review review
    ) {

        ReviewResponseDto dto =
                new ReviewResponseDto();

        dto.setId(review.getId());

        dto.setRating(review.getRating());

        dto.setFeedback(review.getFeedback());

        dto.setReviewedAt(review.getReviewedAt());

        dto.setClientName(
                review.getClient().getName()
        );

        dto.setFreelancerName(
                review.getFreelancer().getName()
        );

        dto.setApplicationId(
                review.getApplication().getId()
        );

        return dto;
    }
}