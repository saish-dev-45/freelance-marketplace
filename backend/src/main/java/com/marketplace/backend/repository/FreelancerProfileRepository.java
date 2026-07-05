package com.marketplace.backend.repository;

import com.marketplace.backend.entity.FreelancerProfile;
import com.marketplace.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FreelancerProfileRepository
        extends JpaRepository<FreelancerProfile, Long> {

    FreelancerProfile findByUser(User user);
}