package com.marketplace.backend.controller;

import com.marketplace.backend.dto.ProjectRequestDto;
import com.marketplace.backend.dto.ProjectResponseDto;
import com.marketplace.backend.entity.User;
import com.marketplace.backend.service.ProjectService;

import jakarta.servlet.http.HttpSession;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/projects")
public class ProjectController {

    @Autowired
    private ProjectService projectService;

    @PostMapping("/create")
    public Object createProject(
            @RequestBody ProjectRequestDto request,
            HttpSession session
    ) {

        User user = (User) session.getAttribute("user");

        if (user == null) {
            return "Please login first";
        }

        if (!user.getRole().equalsIgnoreCase("CLIENT")) {
            return "Only clients can post projects";
        }

        ProjectResponseDto response =
                projectService.createProject(request, user);

        return response;
    }

    @GetMapping("/my-projects")
    public Object getMyProjects(HttpSession session) {

        User user = (User) session.getAttribute("user");

        if (user == null) {
            return "Please login first";
        }

        if (!user.getRole().equalsIgnoreCase("CLIENT")) {
            return "Access denied";
        }

        List<ProjectResponseDto> projects =
                projectService.getClientProjects(user);

        return projects;
    }
    @PutMapping("/{id}")
    public Object updateProject(
            @PathVariable Long id,
            @RequestBody ProjectRequestDto request,
            HttpSession session
    ) {

        User user = (User) session.getAttribute("user");

        if (user == null) {
            return "Please login first";
        }

        if (!user.getRole().equalsIgnoreCase("CLIENT")) {
            return "Only clients can edit projects";
        }

        return projectService.updateProject(id, request, user);
    }
    @DeleteMapping("/{id}")
    public Object deleteProject(
            @PathVariable Long id,
            HttpSession session
    ) {

        User user = (User) session.getAttribute("user");

        if (user == null) {
            return "Please login first";
        }

        if (!user.getRole().equalsIgnoreCase("CLIENT")) {
            return "Only clients can delete projects";
        }

        return projectService.deleteProject(id, user);
    }
    @GetMapping("/open")
    public Object getOpenProjects(HttpSession session) {

        User user = (User) session.getAttribute("user");

        if (user == null) {
            return "Please login first";
        }

        if (!user.getRole().equalsIgnoreCase("FREELANCER")) {
            return "Only freelancers can browse projects";
        }

        return projectService.getOpenProjects();
    }

    @GetMapping("/open/{id}")
    public Object getOpenProjectById(
            @PathVariable Long id,
            HttpSession session
    ) {

        User user = (User) session.getAttribute("user");

        if (user == null) {
            return "Please login first";
        }

        if (!user.getRole().equalsIgnoreCase("FREELANCER")) {
            return "Only freelancers can view project details";
        }

        try {
            return projectService.getOpenProjectById(id);
        } catch (RuntimeException e) {
            return e.getMessage();
        }
    }
}
