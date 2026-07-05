package com.marketplace.backend.repository;

import com.marketplace.backend.entity.Review;
import com.marketplace.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ReviewRepository extends JpaRepository<Review, Long> {

    boolean existsByApplicationId(Long applicationId);

    Optional<Review> findByApplicationId(Long applicationId);

    List<Review> findByFreelancer(User freelancer);

}