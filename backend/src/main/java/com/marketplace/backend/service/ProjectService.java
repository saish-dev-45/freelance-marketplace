package com.marketplace.backend.service;

import com.marketplace.backend.dto.ProjectRequestDto;
import com.marketplace.backend.dto.ProjectResponseDto;
import com.marketplace.backend.entity.Project;
import com.marketplace.backend.entity.User;
import com.marketplace.backend.repository.ProjectRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProjectService {

    @Autowired
    private ProjectRepository projectRepository;

    public ProjectResponseDto createProject(ProjectRequestDto request,
                                            User client) {

        Project project = new Project();

        project.setTitle(request.getTitle());
        project.setDescription(request.getDescription());
        project.setBudget(request.getBudget());
        project.setDeadline(request.getDeadline());
        project.setSkills(request.getSkills());

        project.setStatus("OPEN");
        project.setClient(client);

        Project savedProject = projectRepository.save(project);

        return convertToDto(savedProject);
    }

    public List<ProjectResponseDto> getClientProjects(User client) {

        List<Project> projects =
                projectRepository.findByClientId(client.getId());

        return projects.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    private ProjectResponseDto convertToDto(Project project) {

        ProjectResponseDto dto = new ProjectResponseDto();

        dto.setId(project.getId());
        dto.setTitle(project.getTitle());
        dto.setDescription(project.getDescription());
        dto.setBudget(project.getBudget());
        dto.setDeadline(project.getDeadline());
        dto.setSkills(project.getSkills());
        dto.setStatus(project.getStatus());

        dto.setClientName(project.getClient().getName());
        dto.setClientUsername(project.getClient().getUsername());

        return dto;
    }
    public ProjectResponseDto updateProject(Long projectId,
                                            ProjectRequestDto request,
                                            User user) {

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));

        // Check ownership
        if (!project.getClient().getId().equals(user.getId())) {
            throw new RuntimeException("You can only edit your own projects");
        }

        project.setTitle(request.getTitle());
        project.setDescription(request.getDescription());
        project.setBudget(request.getBudget());
        project.setDeadline(request.getDeadline());
        project.setSkills(request.getSkills());
        if (request.getStatus() != null) {
            project.setStatus(request.getStatus().toUpperCase());
        }

        Project updatedProject = projectRepository.save(project);

        return convertToDto(updatedProject);
    }
    public String deleteProject(Long projectId, User user) {

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));

        // Check ownership
        if (!project.getClient().getId().equals(user.getId())) {
            throw new RuntimeException("You can only delete your own projects");
        }

        projectRepository.delete(project);

        return "Project deleted successfully";
    }
    public List<ProjectResponseDto> getOpenProjects() {

        List<Project> projects =
                projectRepository.findByStatus("OPEN");

        return projects.stream()
                .map(this::convertToDto)
                .toList();
    }

    public ProjectResponseDto getOpenProjectById(Long projectId) {

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));

        if (!project.getStatus().equalsIgnoreCase("OPEN")) {
            throw new RuntimeException("Project is closed");
        }

        return convertToDto(project);
    }
}
