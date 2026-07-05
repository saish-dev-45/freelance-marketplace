package com.marketplace.backend.controller;

import com.marketplace.backend.dto.ApplicationStatusRequestDto;
import com.marketplace.backend.entity.Application;
import com.marketplace.backend.entity.User;
import com.marketplace.backend.repository.ApplicationRepository;
import com.marketplace.backend.service.ApplicationService;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/applications")
public class ApplicationController {

    @Autowired
    private ApplicationService applicationService;

    @Autowired
    private ApplicationRepository applicationRepository;

    @PostMapping("/project/{projectId}")
    public Object applyForProject(
            @PathVariable Long projectId,
            @RequestParam("resume") MultipartFile resume,
            HttpSession session
    ) {

        User user = (User) session.getAttribute("user");

        if (user == null) {
            return "Please login first";
        }

        if (!user.getRole().equalsIgnoreCase("FREELANCER")) {
            return "Only freelancers can apply";
        }

        try {
            return applicationService.applyForProject(
                    projectId,
                    resume,
                    user
            );
        } catch (Exception e) {
            return e.getMessage();
        }
    }

    @GetMapping("/{applicationId}/resume")
    public ResponseEntity<byte[]> getResume(
            @PathVariable Long applicationId
    ) {

        Application application = applicationRepository
                .findById(applicationId)
                .orElseThrow(() ->
                        new RuntimeException("Application not found"));

        return ResponseEntity.ok()
                .header(
                        HttpHeaders.CONTENT_TYPE,
                        MediaType.APPLICATION_OCTET_STREAM_VALUE
                )
                .body(application.getResumeImage());
    }

    @GetMapping("/project/{projectId}")
    public Object getApplicationsForProject(
            @PathVariable Long projectId,
            HttpSession session
    ) {

        User user = (User) session.getAttribute("user");

        if (user == null) {
            return "Please login first";
        }

        if (!user.getRole().equalsIgnoreCase("CLIENT")) {
            return "Only clients can view applications";
        }

        try {
            return applicationService.getApplicationsForProject(
                    projectId,
                    user
            );
        } catch (RuntimeException e) {
            return e.getMessage();
        }
    }

    @GetMapping("/my-applications")
    public Object getMyApplications(HttpSession session) {

        User user = (User) session.getAttribute("user");

        if (user == null) {
            return "Please login first";
        }

        if (!user.getRole().equalsIgnoreCase("FREELANCER")) {
            return "Only freelancers can view applied jobs";
        }

        return applicationService.getApplicationsForFreelancer(user);
    }

    @PutMapping("/{applicationId}/status")
    public Object updateApplicationStatus(
            @PathVariable Long applicationId,
            @RequestBody ApplicationStatusRequestDto request,
            HttpSession session
    ) {

        User user = (User) session.getAttribute("user");

        if (user == null) {
            return "Please login first";
        }

        if (!user.getRole().equalsIgnoreCase("CLIENT")) {
            return "Only clients can update application status";
        }

        try {
            return applicationService.updateApplicationStatus(
                    applicationId,
                    request.getStatus(),
                    user
            );
        } catch (RuntimeException e) {
            return e.getMessage();
        }
    }
}
