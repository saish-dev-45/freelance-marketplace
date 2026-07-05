package com.marketplace.backend.controller;

import com.marketplace.backend.entity.User;
import com.marketplace.backend.service.NotificationService;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

@RestController
@RequestMapping("/notifications")
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    @GetMapping
    public Object getNotifications(HttpSession session) {

        User user = (User) session.getAttribute("user");

        if (user == null) {
            return "Please login first";
        }

        return notificationService.getNotifications(user);
    }

    @GetMapping("/unread-count")
    public Object getUnreadCount(HttpSession session) {

        User user = (User) session.getAttribute("user");

        if (user == null) {
            return "Please login first";
        }

        return notificationService.getUnreadCount(user);
    }

    @PutMapping("/{notificationId}/read")
    public Object markAsRead(
            @PathVariable Long notificationId,
            HttpSession session
    ) {

        User user = (User) session.getAttribute("user");

        if (user == null) {
            return "Please login first";
        }

        try {
            return notificationService.markAsRead(notificationId, user);
        } catch (RuntimeException e) {
            return e.getMessage();
        }
    }

    @PutMapping("/read-all")
    public Object markAllAsRead(HttpSession session) {

        User user = (User) session.getAttribute("user");

        if (user == null) {
            return "Please login first";
        }

        return notificationService.markAllAsRead(user);
    }

    @GetMapping("/stream")
    public SseEmitter streamNotifications(HttpSession session) {

        User user = (User) session.getAttribute("user");

        if (user == null) {
            throw new RuntimeException("Please login first");
        }

        return notificationService.subscribe(user);
    }
}
