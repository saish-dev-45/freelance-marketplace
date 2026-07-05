package com.marketplace.backend.service;

import com.marketplace.backend.dto.FreelancerProfileRequestDto;
import com.marketplace.backend.dto.FreelancerProfileResponseDto;
import com.marketplace.backend.entity.FreelancerProfile;
import com.marketplace.backend.entity.User;
import com.marketplace.backend.repository.FreelancerProfileRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class FreelancerProfileService {

    @Autowired
    private FreelancerProfileRepository freelancerProfileRepository;

    public FreelancerProfileResponseDto createProfile(
            FreelancerProfileRequestDto request,
            User user
    ) {

        FreelancerProfile existingProfile =
                freelancerProfileRepository.findByUser(user);

        if (existingProfile != null) {
            throw new RuntimeException("Freelancer profile already exists");
        }

        FreelancerProfile profile = new FreelancerProfile();

        profile.setProfessionalTitle(request.getProfessionalTitle());
        profile.setCurrentCollege(request.getCurrentCollege());
        profile.setCurrentCompany(request.getCurrentCompany());
        profile.setShortBio(request.getShortBio());
        profile.setExperienceLevel(request.getExperienceLevel());
        profile.setExpertise(request.getExpertise());
        profile.setNotableProjects(request.getNotableProjects());

        profile.setUser(user);

        FreelancerProfile savedProfile =
                freelancerProfileRepository.save(profile);

        return convertToDto(savedProfile);
    }

    public FreelancerProfileResponseDto getProfile(User user) {

        FreelancerProfile profile =
                freelancerProfileRepository.findByUser(user);

        if (profile == null) {
            throw new RuntimeException("Freelancer profile not found");
        }

        return convertToDto(profile);
    }

    public FreelancerProfileResponseDto updateProfile(
            FreelancerProfileRequestDto request,
            User user
    ) {

        FreelancerProfile profile =
                freelancerProfileRepository.findByUser(user);

        if (profile == null) {
            throw new RuntimeException("Freelancer profile not found");
        }

        profile.setProfessionalTitle(request.getProfessionalTitle());
        profile.setCurrentCollege(request.getCurrentCollege());
        profile.setCurrentCompany(request.getCurrentCompany());
        profile.setShortBio(request.getShortBio());
        profile.setExperienceLevel(request.getExperienceLevel());
        profile.setExpertise(request.getExpertise());
        profile.setNotableProjects(request.getNotableProjects());

        FreelancerProfile updatedProfile =
                freelancerProfileRepository.save(profile);

        return convertToDto(updatedProfile);
    }

    public String deleteProfile(User user) {

        FreelancerProfile profile =
                freelancerProfileRepository.findByUser(user);

        if (profile == null) {
            throw new RuntimeException("Freelancer profile not found");
        }

        freelancerProfileRepository.delete(profile);

        return "Freelancer profile deleted successfully";
    }

    private FreelancerProfileResponseDto convertToDto(
            FreelancerProfile profile
    ) {

        FreelancerProfileResponseDto dto =
                new FreelancerProfileResponseDto();

        dto.setId(profile.getId());

        dto.setProfessionalTitle(
                profile.getProfessionalTitle()
        );

        dto.setCurrentCollege(
                profile.getCurrentCollege()
        );

        dto.setCurrentCompany(
                profile.getCurrentCompany()
        );

        dto.setShortBio(
                profile.getShortBio()
        );

        dto.setExperienceLevel(
                profile.getExperienceLevel()
        );

        dto.setExpertise(
                profile.getExpertise()
        );

        dto.setNotableProjects(
                profile.getNotableProjects()
        );

        dto.setUsername(
                profile.getUser().getUsername()
        );

        dto.setName(
                profile.getUser().getName()
        );

        return dto;
    }
}