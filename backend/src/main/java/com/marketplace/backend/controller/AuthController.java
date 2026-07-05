
        package com.marketplace.backend.controller;

import com.marketplace.backend.dto.LoginDto;
import com.marketplace.backend.dto.RegisterRequestDto;
import com.marketplace.backend.entity.User;
import com.marketplace.backend.service.UserService;

import jakarta.servlet.http.HttpSession;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")



public class AuthController {

    @Autowired
    private UserService userService;

    @PostMapping("/register")
    public User register(
            @RequestBody RegisterRequestDto request
    ) {

        return userService.registerUser(request);
    }

    @PostMapping("/login")
    public String login(

            @RequestBody LoginDto request,

            HttpSession session
    ) {

        return userService.loginUser(
                request,
                session
        );
    }
    @GetMapping("/me")
    public User getloggeduser(HttpSession session) {
        return  (User)session.getAttribute("user");
    }
    @PostMapping("/logout")
    public ResponseEntity<?> logoutUser(HttpSession session){
        session.invalidate();
        return ResponseEntity.ok("Logout successful");
    }
}
