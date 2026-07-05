package com.marketplace.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(length = 1000)
    private String message;

    private String type;

    @Column(name = "is_read")
    private boolean read;

    private LocalDateTime createdAt;

    private Long applicationId;

    private Long projectId;

    @ManyToOne
    @JoinColumn(name = "recipient_id")
    private User recipient;
}
