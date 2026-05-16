package com.parking.system.controller;

import com.parking.system.dto.FeedbackDto;
import com.parking.system.entity.Feedback;
import com.parking.system.entity.User;
import com.parking.system.service.FeedbackService;
import com.parking.system.service.UserService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/feedback")
@CrossOrigin(origins = "*")
public class FeedbackController {

    private final FeedbackService feedbackService;
    private final UserService userService;

    @Autowired
    public FeedbackController(
            FeedbackService feedbackService,
            UserService userService
    ) {
        this.feedbackService = feedbackService;
        this.userService = userService;
    }

    // Convert entity to DTO
    private FeedbackDto mapToDto(Feedback feedback) {

        FeedbackDto dto = new FeedbackDto();

        dto.setId(feedback.getId());

        if (feedback.getUser() != null) {
            dto.setUserId(feedback.getUser().getId());
            dto.setUserName(feedback.getUser().getName());
        }

        dto.setMessage(feedback.getMessage());
        dto.setRating(feedback.getRating());
        dto.setDate(feedback.getDate());

        return dto;
    }

    // Create feedback
    @PostMapping
    public ResponseEntity<?> createFeedback(
            @RequestBody FeedbackDto dto
    ) {

        try {

            User user = userService.getUserById(dto.getUserId());

            Feedback feedback = new Feedback();

            feedback.setUser(user);
            feedback.setMessage(dto.getMessage());
            feedback.setRating(dto.getRating());
            feedback.setDate(LocalDateTime.now());

            Feedback saved = feedbackService.saveFeedback(feedback);

            return ResponseEntity.ok(mapToDto(saved));

        } catch (Exception e) {

            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // Get all feedback
    @GetMapping
    public ResponseEntity<List<FeedbackDto>> getAllFeedback() {

        List<FeedbackDto> dtos = feedbackService.getAllFeedback()
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());

        return ResponseEntity.ok(dtos);
    }

    // Get latest feedback
    @GetMapping("/latest")
    public ResponseEntity<List<FeedbackDto>> getLatestFeedback() {

        List<FeedbackDto> dtos = feedbackService.getLatestFeedback()
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());

        return ResponseEntity.ok(dtos);
    }

    // Get feedback by ID
    @GetMapping("/{id}")
    public ResponseEntity<?> getFeedbackById(
            @PathVariable Long id
    ) {

        try {

            Feedback feedback = feedbackService.getFeedbackById(id);

            return ResponseEntity.ok(mapToDto(feedback));

        } catch (Exception e) {

            return ResponseEntity.status(404)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // Update feedback
    @PutMapping("/{id}")
    public ResponseEntity<?> updateFeedback(
            @PathVariable Long id,
            @RequestBody FeedbackDto dto
    ) {

        try {

            Feedback updated = feedbackService.updateFeedback(
                    id,
                    dto.getMessage(),
                    dto.getRating()
            );

            return ResponseEntity.ok(mapToDto(updated));

        } catch (Exception e) {

            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // Delete feedback
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteFeedback(
            @PathVariable Long id
    ) {

        try {

            feedbackService.deleteFeedback(id);

            return ResponseEntity.ok(
                    Map.of("message", "Feedback deleted successfully")
            );

        } catch (Exception e) {

            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        }
    }
}