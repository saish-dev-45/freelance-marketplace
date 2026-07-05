package com.marketplace.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "applications")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Application {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /*
     * Application Status:
     * PENDING
     * ACCEPTED
     * REJECTED
     */
    private String status;

    /*
     * Date and time when the freelancer applied
     */
    private LocalDateTime appliedAt;

    /*
     * Resume file uploaded while applying.
     * Stored directly in the PostgreSQL database.
     */
    @Column(
            name = "resume_image",
            columnDefinition = "BYTEA"
    )
    private byte[] resumeImage;

    /*
     * Freelancer who applied
     */
    @ManyToOne
    @JoinColumn(name = "freelancer_id")
    private User freelancer;

    /*
     * Project to which the freelancer applied
     */
    @ManyToOne
    @JoinColumn(name = "project_id")
    private Project project;
}
