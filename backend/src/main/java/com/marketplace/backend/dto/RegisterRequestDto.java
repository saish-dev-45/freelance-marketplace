package com.marketplace.backend.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RegisterRequestDto {
    private String name;
    private String username;
    private String password;
    private String email;
    private String role;
    private String country;
}
