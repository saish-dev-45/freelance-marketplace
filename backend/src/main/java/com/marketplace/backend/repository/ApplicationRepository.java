package com.marketplace.backend.repository;

import com.marketplace.backend.entity.Application;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ApplicationRepository extends JpaRepository<Application, Long> {

    List<Application> findByProjectId(Long projectId);

    List<Application> findByFreelancerId(Long freelancerId);

    boolean existsByFreelancerIdAndProjectId(
            Long freelancerId,
            Long projectId
    );
}