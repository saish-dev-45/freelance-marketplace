package com.marketplace.backend.service;

import com.marketplace.backend.dto.ApplicationResponseDto;
import com.marketplace.backend.entity.Application;
import com.marketplace.backend.entity.Project;
import com.marketplace.backend.entity.User;
import com.marketplace.backend.repository.ApplicationRepository;
import com.marketplace.backend.repository.ProjectRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ApplicationService {

    @Autowired
    private ApplicationRepository applicationRepository;

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private NotificationService notificationService;

    public ApplicationResponseDto applyForProject(
            Long projectId,
            MultipartFile resume,
            User freelancer
    ) throws IOException {

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() ->
                        new RuntimeException("Project not found"));

        if (!project.getStatus().equalsIgnoreCase("OPEN")) {
            throw new RuntimeException("Project is closed");
        }

        boolean alreadyApplied =
                applicationRepository.existsByFreelancerIdAndProjectId(
                        freelancer.getId(),
                        projectId
                );

        if (alreadyApplied) {
            throw new RuntimeException(
                    "You have already applied for this project"
            );
        }

        if (resume == null || resume.isEmpty()) {
            throw new RuntimeException(
                    "Resume file is mandatory"
            );
        }

        String contentType = resume.getContentType();

        if (contentType == null ||
                (!contentType.equals("image/jpeg")
                        && !contentType.equals("image/jpg")
                        && !contentType.equals("image/png")
                        && !contentType.equals("application/pdf"))) {

            throw new RuntimeException(
                    "Only PDF, JPG, and PNG resume files are allowed"
            );
        }

        Application application = new Application();

        application.setStatus("PENDING");

        application.setAppliedAt(LocalDateTime.now());

        application.setResumeImage(resume.getBytes());

        application.setFreelancer(freelancer);

        application.setProject(project);

        Application savedApplication =
                applicationRepository.save(application);

        return convertToDto(savedApplication);
    }

    public List<ApplicationResponseDto> getApplicationsForProject(
            Long projectId,
            User client
    ) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() ->
                        new RuntimeException("Project not found"));

        if (!project.getClient().getId().equals(client.getId())) {
            throw new RuntimeException(
                    "You can only view applications for your own projects"
            );
        }

        return applicationRepository.findByProjectId(projectId)
                .stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public List<ApplicationResponseDto> getApplicationsForFreelancer(
            User freelancer
    ) {

        return applicationRepository.findByFreelancerId(freelancer.getId())
                .stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public ApplicationResponseDto updateApplicationStatus(
            Long applicationId,
            String status,
            User client
    ) {

        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() ->
                        new RuntimeException("Application not found"));

        if (!application.getProject().getClient().getId().equals(client.getId())) {
            throw new RuntimeException(
                    "You can only update applications for your own projects"
            );
        }

        if (status == null) {
            throw new RuntimeException("Application status is required");
        }

        String normalizedStatus = status.trim().toUpperCase();

        if (!normalizedStatus.equals("PENDING")
                && !normalizedStatus.equals("ACCEPTED")
                && !normalizedStatus.equals("REJECTED")) {
            throw new RuntimeException(
                    "Application status must be PENDING, ACCEPTED, or REJECTED"
            );
        }

        String previousStatus = application.getStatus();

        application.setStatus(normalizedStatus);

        Application updatedApplication =
                applicationRepository.save(application);

        if (normalizedStatus.equals("ACCEPTED")
                && !normalizedStatus.equalsIgnoreCase(previousStatus)) {

            Project project = updatedApplication.getProject();

            if (!project.getStatus().equalsIgnoreCase("COMPLETED")) {
                project.setStatus("IN_PROGRESS");
                projectRepository.save(project);
            }

            notificationService.createApplicationAcceptedNotification(
                    updatedApplication.getFreelancer(),
                    updatedApplication.getId(),
                    updatedApplication.getProject().getId(),
                    updatedApplication.getProject().getTitle()
            );
        }

        return convertToDto(updatedApplication);
    }

    private ApplicationResponseDto convertToDto(
            Application application
    ) {

        ApplicationResponseDto dto =
                new ApplicationResponseDto();

        dto.setId(application.getId());

        dto.setStatus(application.getStatus());

        dto.setAppliedAt(application.getAppliedAt());

        dto.setProjectId(application.getProject().getId());

        dto.setProjectTitle(application.getProject().getTitle());

        dto.setProjectDescription(application.getProject().getDescription());

        dto.setProjectBudget(application.getProject().getBudget());

        dto.setProjectDeadline(application.getProject().getDeadline());

        dto.setProjectSkills(application.getProject().getSkills());

        dto.setProjectStatus(application.getProject().getStatus());

        dto.setClientName(application.getProject().getClient().getName());

        dto.setClientUsername(
                application.getProject().getClient().getUsername()
        );

        dto.setFreelancerId(application.getFreelancer().getId());

        dto.setFreelancerName(application.getFreelancer().getName());

        dto.setFreelancerUsername(
                application.getFreelancer().getUsername()
        );

        return dto;
    }
}
