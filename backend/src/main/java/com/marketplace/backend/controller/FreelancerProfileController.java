package com.marketplace.backend.controller;

import com.marketplace.backend.dto.FreelancerProfileRequestDto;
import com.marketplace.backend.entity.User;
import com.marketplace.backend.service.FreelancerProfileService;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/freelancer/profile")
public class FreelancerProfileController {

    @Autowired
    private FreelancerProfileService freelancerProfileService;

    @PostMapping
    public Object createProfile(
            @RequestBody FreelancerProfileRequestDto request,
            HttpSession session
    ) {

        User user = (User) session.getAttribute("user");

        if (user == null) {
            return "Please login first";
        }

        if (!user.getRole().equalsIgnoreCase("FREELANCER")) {
            return "Only freelancers can create profiles";
        }

        return freelancerProfileService.createProfile(
                request,
                user
        );
    }

    @GetMapping
    public Object getProfile(HttpSession session) {

        User user = (User) session.getAttribute("user");

        if (user == null) {
            return "Please login first";
        }

        if (!user.getRole().equalsIgnoreCase("FREELANCER")) {
            return "Access denied";
        }

        return freelancerProfileService.getProfile(user);
    }

    @PutMapping
    public Object updateProfile(
            @RequestBody FreelancerProfileRequestDto request,
            HttpSession session
    ) {

        User user = (User) session.getAttribute("user");

        if (user == null) {
            return "Please login first";
        }

        if (!user.getRole().equalsIgnoreCase("FREELANCER")) {
            return "Access denied";
        }

        return freelancerProfileService.updateProfile(
                request,
                user
        );
    }

    @DeleteMapping
    public Object deleteProfile(HttpSession session) {

        User user = (User) session.getAttribute("user");

        if (user == null) {
            return "Please login first";
        }

        if (!user.getRole().equalsIgnoreCase("FREELANCER")) {
            return "Access denied";
        }

        return freelancerProfileService.deleteProfile(user);
    }
}