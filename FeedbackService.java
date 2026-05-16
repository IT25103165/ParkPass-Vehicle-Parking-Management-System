package com.parking.system.service;

import com.parking.system.entity.Feedback;
import com.parking.system.util.FileHandler;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class FeedbackService {

    private final FileHandler fileHandler;

    @Autowired
    public FeedbackService(FileHandler fileHandler) {
        this.fileHandler = fileHandler;
    }

    // Save new feedback
    public Feedback saveFeedback(Feedback feedback) {

        if (feedback.getMessage() == null || feedback.getMessage().isBlank()) {
            throw new RuntimeException("Feedback message cannot be empty");
        }

        if (feedback.getRating() < 1 || feedback.getRating() > 5) {
            throw new RuntimeException("Rating must be between 1 and 5");
        }

        fileHandler.saveFeedback(feedback);

        return feedback;
    }

    // Get all feedback
    public List<Feedback> getAllFeedback() {
        return fileHandler.getAllFeedback();
    }

    // Get latest feedback
    public List<Feedback> getLatestFeedback() {

        return fileHandler.getAllFeedback().stream()
                .sorted((f1, f2) -> f2.getDate().compareTo(f1.getDate()))
                .limit(5)
                .toList();
    }

    // Get feedback by ID
    public Feedback getFeedbackById(Long id) {

        return fileHandler.getAllFeedback().stream()
                .filter(f -> f.getId().equals(id))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Feedback not found"));
    }

    // Update feedback
    public Feedback updateFeedback(
            Long id,
            String message,
            int rating
    ) {

        Feedback feedback = getFeedbackById(id);

        if (message != null && !message.isBlank()) {
            feedback.setMessage(message);
        }

        if (rating >= 1 && rating <= 5) {
            feedback.setRating(rating);
        }

        fileHandler.saveFeedback(feedback);

        return feedback;
    }

    // Delete feedback
    public void deleteFeedback(Long id) {

        Feedback feedback = getFeedbackById(id);

        fileHandler.deleteFeedback(feedback.getId());
    }
}