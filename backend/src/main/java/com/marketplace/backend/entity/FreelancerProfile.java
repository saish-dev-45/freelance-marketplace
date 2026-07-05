package com.marketplace.backend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "freelancer_profiles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class FreelancerProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String professionalTitle;

    private String currentCollege;

    private String currentCompany;

    @Column(length = 2000)
    private String shortBio;

    private String experienceLevel;

    @Column(length = 1000)
    private String expertise;

    @Column(length = 1000)
    private String notableProjects;

    @OneToOne
    @JoinColumn(name = "user_id")
    private User user;
}