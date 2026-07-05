package com.marketplace.backend.controller;

import com.marketplace.backend.dto.MilestoneRequestDto;
import com.marketplace.backend.entity.User;
import com.marketplace.backend.service.MilestoneService;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/milestones")
public class MilestoneController {

    @Autowired
    private MilestoneService milestoneService;

    @PostMapping("/application/{applicationId}")
    public Object createMilestone(
            @PathVariable Long applicationId,
            @RequestBody MilestoneRequestDto request,
            HttpSession session
    ) {

        User user = (User) session.getAttribute("user");

        if (user == null) {
            return "Please login first";
        }

        if (!user.getRole().equalsIgnoreCase("CLIENT")) {
            return "Only clients can create milestones";
        }

        try {
            return milestoneService.createMilestone(
                    applicationId,
                    request,
                    user
            );
        } catch (RuntimeException e) {
            return e.getMessage();
        }
    }

    @GetMapping("/application/{applicationId}")
    public Object getMilestones(
            @PathVariable Long applicationId,
            HttpSession session
    ) {

        User user = (User) session.getAttribute("user");

        if (user == null) {
            return "Please login first";
        }

        try {
            return milestoneService.getMilestones(
                    applicationId,
                    user
            );
        } catch (RuntimeException e) {
            return e.getMessage();
        }
    }

    @PutMapping("/{milestoneId}/complete")
    public Object completeMilestone(
            @PathVariable Long milestoneId,
            HttpSession session
    ) {

        User user = (User) session.getAttribute("user");

        if (user == null) {
            return "Please login first";
        }

        if (!user.getRole().equalsIgnoreCase("FREELANCER")) {
            return "Only freelancers can complete milestones";
        }

        try {
            return milestoneService.completeMilestone(
                    milestoneId,
                    user
            );
        } catch (RuntimeException e) {
            return e.getMessage();
        }
    }
}
