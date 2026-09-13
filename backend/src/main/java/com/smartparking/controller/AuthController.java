package com.smartparking.controller;

import com.smartparking.entity.User;
import com.smartparking.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserRepository userRepository;

    public AuthController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    // =========================
    // REGISTER
    // =========================
    @PostMapping(value = "/register", consumes = "application/json")
    public ResponseEntity<?> register(@RequestBody Map<String, Object> data) {

        try {

            if (data == null || data.isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("message", "Request body is empty"));
            }

            String name = data.get("name") == null
                    ? ""
                    : String.valueOf(data.get("name")).trim();

            String email = data.get("email") == null
                    ? ""
                    : String.valueOf(data.get("email")).trim();

            String phone = data.get("phone") == null
                    ? null
                    : String.valueOf(data.get("phone")).trim();

            String password = data.get("password") == null
                    ? ""
                    : String.valueOf(data.get("password"));

            // Required fields
            if (name.isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("message", "Name is required"));
            }

            if (email.isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("message", "Email is required"));
            }

            if (password.isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("message", "Password is required"));
            }

            // Check existing email
            if (userRepository.findByEmail(email).isPresent()) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                        .body(Map.of("message", "Email already registered"));
            }

            // Create user
            User user = new User();

            user.setName(name);
            user.setEmail(email);
            user.setPhone(phone);
            user.setPassword(password);
            user.setRole("USER");

            User savedUser = userRepository.save(user);

            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(
                            Map.of(
                                    "message", "Registration successful",
                                    "user", Map.of(
                                            "id", savedUser.getId(),
                                            "name", savedUser.getName(),
                                            "email", savedUser.getEmail(),
                                            "role", savedUser.getRole()
                                    )
                            )
                    );

        } catch (Exception e) {

            e.printStackTrace();

            Map<String, String> response = new HashMap<>();
            response.put("message", "Registration failed");
            response.put(
                    "error",
                    e.getMessage() == null ? e.toString() : e.getMessage()
            );

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(response);
        }
    }

    // =========================
    // LOGIN
    // =========================
    @PostMapping(value = "/login", consumes = "application/json")
    public ResponseEntity<?> login(@RequestBody Map<String, Object> data) {

        try {

            if (data == null || data.isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("message", "Request body is empty"));
            }

            String email = data.get("email") == null
                    ? ""
                    : String.valueOf(data.get("email")).trim();

            String password = data.get("password") == null
                    ? ""
                    : String.valueOf(data.get("password"));

            if (email.isEmpty() || password.isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("message", "Email and password are required"));
            }

            User user = userRepository.findByEmail(email).orElse(null);

            if (user == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("message", "Invalid email or password"));
            }

            if (!user.getPassword().equals(password)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("message", "Invalid email or password"));
            }

            return ResponseEntity.ok(
                    Map.of(
                            "message", "Login successful",
                            "user", Map.of(
                                    "id", user.getId(),
                                    "name", user.getName(),
                                    "email", user.getEmail(),
                                    "role", user.getRole()
                            )
                    )
            );

        } catch (Exception e) {

            e.printStackTrace();

            Map<String, String> response = new HashMap<>();
            response.put("message", "Login failed");
            response.put(
                    "error",
                    e.getMessage() == null ? e.toString() : e.getMessage()
            );

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(response);
        }
    }
}