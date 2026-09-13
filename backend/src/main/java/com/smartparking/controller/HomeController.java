package com.smartparking.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HomeController {

    @GetMapping("/")
    public String home() {
        return """
                {
                    "application": "Smart Car Parking Management System",
                    "status": "Running",
                    "backend": "Spring Boot",
                    "message": "Backend API is working successfully"
                }
                """;
    }

    @GetMapping("/api")
    public String apiHome() {
        return """
                {
                    "message": "Smart Car Parking API",
                    "status": "Running"
                }
                """;
    }
}