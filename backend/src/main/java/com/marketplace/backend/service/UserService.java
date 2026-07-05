package com.marketplace.backend.service;

import com.marketplace.backend.dto.LoginDto;
import com.marketplace.backend.dto.RegisterRequestDto;
import com.marketplace.backend.entity.User;
import com.marketplace.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import jakarta.servlet.http.HttpSession;
import org.springframework.web.bind.annotation.PostMapping;

@Service
public class UserService {
    @Autowired
    private UserRepository userRepository;

    public User registerUser(RegisterRequestDto request){
        User user = new User();

        user.setUsername(request.getUsername());
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(request.getPassword());
        user.setRole(request.getRole());
        user.setCountry(request.getCountry());

        return  userRepository.save(user);
    }
    public String loginUser(LoginDto request,HttpSession session){
        User user = userRepository.findByEmail(request.getEmail());
        if(user == null){
            return "User not found";
        }
        if(!user.getPassword().equals(request.getPassword())){
            return "Incorrect password";
        }
        if(!user.getEmail().equals(request.getEmail())){
            return "Incorrect email";
        }
        session.setAttribute("user",user);
        return"Login successful";
    }

}
