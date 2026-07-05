package com.marketplace.backend.repository;

import com.marketplace.backend.entity.Milestone;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MilestoneRepository
        extends JpaRepository<Milestone, Long> {

    List<Milestone> findByApplicationId(Long applicationId);
}