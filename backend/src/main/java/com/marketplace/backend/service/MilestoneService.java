package com.marketplace.backend.service;

import com.marketplace.backend.dto.MilestoneRequestDto;
import com.marketplace.backend.dto.MilestoneResponseDto;
import com.marketplace.backend.entity.Application;
import com.marketplace.backend.entity.Milestone;
import com.marketplace.backend.entity.User;
import com.marketplace.backend.entity.Project;
import com.marketplace.backend.repository.ApplicationRepository;
import com.marketplace.backend.repository.MilestoneRepository;
import com.marketplace.backend.repository.ProjectRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class MilestoneService {

    @Autowired
    private MilestoneRepository milestoneRepository;

    @Autowired
    private ApplicationRepository applicationRepository;

    @Autowired
    private ProjectRepository projectRepository;

    public MilestoneResponseDto createMilestone(
            Long applicationId,
            MilestoneRequestDto request,
            User user
    ) {

        Application application = applicationRepository
                .findById(applicationId)
                .orElseThrow(() ->
                        new RuntimeException("Application not found"));

        /*
         * Only the client who owns the project
         * can create milestones.
         */
        if (!application.getProject()
                .getClient()
                .getId()
                .equals(user.getId())) {

            throw new RuntimeException(
                    "Only the project client can create milestones"
            );
        }

        /*
         * Milestones can only be created
         * after the application is accepted.
         */
        if (!application.getStatus()
                .equalsIgnoreCase("ACCEPTED")) {

            throw new RuntimeException(
                    "Milestones can only be created for accepted applications"
            );
        }

        if (request.getTitle() == null
                || request.getTitle().trim().isEmpty()) {

            throw new RuntimeException("Milestone title is required");
        }

        Milestone milestone = new Milestone();

        milestone.setTitle(request.getTitle().trim());

        milestone.setCompleted(false);

        milestone.setApplication(application);

        Milestone savedMilestone =
                milestoneRepository.save(milestone);

        return convertToDto(savedMilestone);
    }

    public List<MilestoneResponseDto> getMilestones(
            Long applicationId,
            User user
    ) {

        Application application = applicationRepository
                .findById(applicationId)
                .orElseThrow(() ->
                        new RuntimeException("Application not found"));

        /*
         * Only the client and accepted freelancer
         * can view milestones.
         */
        boolean isClient = application.getProject()
                .getClient()
                .getId()
                .equals(user.getId());

        boolean isFreelancer = application.getFreelancer()
                .getId()
                .equals(user.getId());

        if (!isClient && !isFreelancer) {
            throw new RuntimeException(
                    "Access denied"
            );
        }

        return milestoneRepository
                .findByApplicationId(applicationId)
                .stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public MilestoneResponseDto completeMilestone(
            Long milestoneId,
            User user
    ) {

        Milestone milestone = milestoneRepository
                .findById(milestoneId)
                .orElseThrow(() ->
                        new RuntimeException("Milestone not found"));

        /*
         * Only the accepted freelancer
         * can mark milestones as complete.
         */
        if (!milestone.getApplication()
                .getFreelancer()
                .getId()
                .equals(user.getId())) {

            throw new RuntimeException(
                    "Only the assigned freelancer can complete milestones"
            );
        }

        if (Boolean.TRUE.equals(milestone.getCompleted())) {
            throw new RuntimeException("Milestone is already completed");
        }

        milestone.setCompleted(true);

        Milestone updatedMilestone =
                milestoneRepository.save(milestone);

        checkAndCompleteProject(updatedMilestone);

        return convertToDto(updatedMilestone);
    }

    private void checkAndCompleteProject(Milestone milestone) {

        Long applicationId = milestone.getApplication().getId();

        List<Milestone> milestones =
                milestoneRepository.findByApplicationId(applicationId);

        if (milestones.isEmpty()) {
            return;
        }

        boolean allCompleted = milestones.stream()
                .allMatch(item -> Boolean.TRUE.equals(item.getCompleted()));

        if (!allCompleted) {
            return;
        }

        Project project = milestone.getApplication().getProject();

        project.setStatus("COMPLETED");

        projectRepository.save(project);
    }

    private MilestoneResponseDto convertToDto(
            Milestone milestone
    ) {

        MilestoneResponseDto dto =
                new MilestoneResponseDto();

        dto.setId(milestone.getId());

        dto.setTitle(milestone.getTitle());

        dto.setCompleted(milestone.getCompleted());

        dto.setApplicationId(
                milestone.getApplication().getId()
        );

        return dto;
    }
}