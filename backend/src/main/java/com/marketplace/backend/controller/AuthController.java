package com.marketplace.backend.controller;


import com.marketplace.backend.dto.LoginDto;
import com.marketplace.backend.dto.RegisterRequestDto;
import com.marketplace.backend.entity.User;
import com.marketplace.backend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = "http://localhost:5173")
public class AuthController {
    @Autowired
    private UserService userService;

    @PostMapping("/register")
    public User register(@RequestBody RegisterRequestDto request) {
        return userService.registerUser(request);
    }
    @PostMapping("/login")
    public String Login(@RequestBody LoginDto request) {
        return userService.loginUser(request);
    }
}
