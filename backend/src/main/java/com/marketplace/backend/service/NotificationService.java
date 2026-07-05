package com.marketplace.backend.service;

import com.marketplace.backend.dto.NotificationResponseDto;
import com.marketplace.backend.entity.Notification;
import com.marketplace.backend.entity.User;
import com.marketplace.backend.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.stream.Collectors;

@Service
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    private final Map<Long, List<SseEmitter>> emitters = new ConcurrentHashMap<>();

    public NotificationResponseDto createApplicationAcceptedNotification(
            User freelancer,
            Long applicationId,
            Long projectId,
            String projectTitle
    ) {

        Notification notification = new Notification();
        notification.setRecipient(freelancer);
        notification.setApplicationId(applicationId);
        notification.setProjectId(projectId);
        notification.setType("APPLICATION_ACCEPTED");
        notification.setRead(false);
        notification.setCreatedAt(LocalDateTime.now());
        notification.setMessage(
                "Your application for \"" + projectTitle + "\" has been accepted."
        );

        Notification savedNotification =
                notificationRepository.save(notification);

        NotificationResponseDto response = convertToDto(savedNotification);
        sendToUser(freelancer.getId(), response);

        return response;
    }

    public List<NotificationResponseDto> getNotifications(User user) {

        return notificationRepository
                .findByRecipientIdOrderByCreatedAtDesc(user.getId())
                .stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public long getUnreadCount(User user) {

        return notificationRepository.countByRecipientIdAndReadFalse(user.getId());
    }

    public NotificationResponseDto markAsRead(Long notificationId, User user) {

        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() ->
                        new RuntimeException("Notification not found"));

        if (!notification.getRecipient().getId().equals(user.getId())) {
            throw new RuntimeException("You can only update your own notifications");
        }

        notification.setRead(true);

        return convertToDto(notificationRepository.save(notification));
    }

    public List<NotificationResponseDto> markAllAsRead(User user) {

        List<Notification> notifications =
                notificationRepository.findByRecipientIdOrderByCreatedAtDesc(user.getId());

        notifications.forEach(notification -> notification.setRead(true));

        return notificationRepository.saveAll(notifications)
                .stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    public SseEmitter subscribe(User user) {

        SseEmitter emitter = new SseEmitter(0L);
        Long userId = user.getId();

        emitters.computeIfAbsent(userId, key -> new CopyOnWriteArrayList<>())
                .add(emitter);

        emitter.onCompletion(() -> removeEmitter(userId, emitter));
        emitter.onTimeout(() -> removeEmitter(userId, emitter));
        emitter.onError(error -> removeEmitter(userId, emitter));

        try {
            emitter.send(SseEmitter.event()
                    .name("connected")
                    .data("Notification stream connected"));
        } catch (IOException e) {
            removeEmitter(userId, emitter);
        }

        return emitter;
    }

    private void sendToUser(Long userId, NotificationResponseDto notification) {

        List<SseEmitter> userEmitters = emitters.get(userId);

        if (userEmitters == null) {
            return;
        }

        userEmitters.forEach(emitter -> {
            try {
                emitter.send(SseEmitter.event()
                        .name("notification")
                        .data(notification));
            } catch (IOException e) {
                removeEmitter(userId, emitter);
            }
        });
    }

    private void removeEmitter(Long userId, SseEmitter emitter) {

        List<SseEmitter> userEmitters = emitters.get(userId);

        if (userEmitters == null) {
            return;
        }

        userEmitters.remove(emitter);

        if (userEmitters.isEmpty()) {
            emitters.remove(userId);
        }
    }

    private NotificationResponseDto convertToDto(Notification notification) {

        NotificationResponseDto dto = new NotificationResponseDto();
        dto.setId(notification.getId());
        dto.setMessage(notification.getMessage());
        dto.setType(notification.getType());
        dto.setRead(notification.isRead());
        dto.setCreatedAt(notification.getCreatedAt());
        dto.setApplicationId(notification.getApplicationId());
        dto.setProjectId(notification.getProjectId());

        return dto;
    }
}
