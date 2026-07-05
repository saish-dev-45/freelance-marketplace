package com.marketplace.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "milestones")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Milestone {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;

    private Boolean completed;

    @ManyToOne
    @JoinColumn(name = "application_id")
    private Application application;
}
