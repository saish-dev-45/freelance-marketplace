package com.marketplace.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "reviews",
        uniqueConstraints = {
                @UniqueConstraint(
                        columnNames = {"application_id"}
                )
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Review {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /*
     * Rating from 1 to 5 stars
     */
    private Integer rating;

    /*
     * Optional feedback from client
     */
    @Column(length = 1000)
    private String feedback;

    /*
     * When the review was submitted
     */
    private LocalDateTime reviewedAt;

    /*
     * Application for which the review was given
     *
     * One completed application can have only one review.
     */
    @OneToOne
    @JoinColumn(name = "application_id")
    private Application application;

    /*
     * Client who gave the review
     */
    @ManyToOne
    @JoinColumn(name = "client_id")
    private User client;

    /*
     * Freelancer who received the review
     */
    @ManyToOne
    @JoinColumn(name = "freelancer_id")
    private User freelancer;
}