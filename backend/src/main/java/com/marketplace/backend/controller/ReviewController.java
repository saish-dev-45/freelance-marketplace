package com.marketplace.backend.controller;

import com.marketplace.backend.dto.ReviewRequestDto;
import com.marketplace.backend.entity.User;
import com.marketplace.backend.service.ReviewService;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/reviews")
public class ReviewController {

    @Autowired
    private ReviewService reviewService;

    /*
     * Client gives review to freelancer
     */
    @PostMapping("/application/{applicationId}")
    public Object giveReview(
            @PathVariable Long applicationId,
            @RequestBody ReviewRequestDto request,
            HttpSession session
    ) {

        User user = (User) session.getAttribute("user");

        if (user == null) {
            return "Please login first";
        }

        if (!user.getRole().equalsIgnoreCase("CLIENT")) {
            return "Only clients can give reviews";
        }

        try {
            return reviewService.giveReview(
                    applicationId,
                    request,
                    user
            );
        } catch (Exception e) {
            return e.getMessage();
        }
    }

    @GetMapping("/application/{applicationId}")
    public Object getReviewForApplication(
            @PathVariable Long applicationId,
            HttpSession session
    ) {

        User user = (User) session.getAttribute("user");

        if (user == null) {
            return "Please login first";
        }

        if (!user.getRole().equalsIgnoreCase("CLIENT")) {
            return "Only clients can view application reviews";
        }

        try {
            return reviewService.getReviewForApplication(
                    applicationId,
                    user
            );
        } catch (Exception e) {
            return e.getMessage();
        }
    }

    @GetMapping("/leaderboard")
    public Object getLeaderboard(HttpSession session) {

        User user = (User) session.getAttribute("user");

        if (user == null) {
            return "Please login first";
        }

        if (!user.getRole().equalsIgnoreCase("CLIENT")
                && !user.getRole().equalsIgnoreCase("FREELANCER")) {

            return "Access denied";
        }

        try {
            return reviewService.getLeaderboard();
        } catch (Exception e) {
            return e.getMessage();
        }
    }

    /*
     * Freelancer views their reviews
     */
    @GetMapping("/my-reviews")
    public Object getMyReviews(
            HttpSession session
    ) {

        User user = (User) session.getAttribute("user");

        if (user == null) {
            return "Please login first";
        }

        if (!user.getRole().equalsIgnoreCase("FREELANCER")) {
            return "Only freelancers can view reviews";
        }

        try {
            return reviewService.getFreelancerReviews(
                    user
            );
        } catch (Exception e) {
            return e.getMessage();
        }
    }
}