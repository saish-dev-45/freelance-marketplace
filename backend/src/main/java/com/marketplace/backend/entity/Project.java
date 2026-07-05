package com.marketplace.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Entity
@Table(name="projects")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Project {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String title;
    @Column(length=3000)
    private String description;
    private double budget;
    private LocalDate deadline;
    private String skills;
    private String status;
    @ManyToOne
    @JoinColumn(name="client_id")
    private User client;

}
