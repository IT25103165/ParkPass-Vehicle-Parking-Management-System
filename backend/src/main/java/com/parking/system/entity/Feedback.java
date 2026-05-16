package com.parking.system.entity;

import java.time.LocalDateTime;

/**
 * Represents a feedback/review left by a user.
 */
public class Feedback {

    private Long id;
    private User user;
    private String message;
    private Integer rating; // 1 to 5 stars
    private LocalDateTime date;

    /**
     * Default constructor.
     */
    public Feedback() {
    }

    /**
     * Gets the feedback ID.
     * @return the feedback ID.
     */
    public Long getId() {
        return id;
    }

    /**
     * Sets the feedback ID.
     * @param id the feedback ID to set.
     */
    public void setId(Long id) {
        this.id = id;
    }

    /**
     * Gets the user who left the feedback.
     * @return the user.
     */
    public User getUser() {
        return user;
    }

    /**
     * Sets the user who left the feedback.
     * @param user the user to set.
     */
    public void setUser(User user) {
        this.user = user;
    }

    /**
     * Gets the feedback message.
     * @return the message.
     */
    public String getMessage() {
        return message;
    }

    /**
     * Sets the feedback message.
     * @param message the message to set.
     */
    public void setMessage(String message) {
        this.message = message;
    }

    /**
     * Gets the rating.
     * @return the rating.
     */
    public Integer getRating() {
        return rating;
    }

    /**
     * Sets the rating.
     * @param rating the rating to set.
     */
    public void setRating(Integer rating) {
        this.rating = rating;
    }

    /**
     * Gets the date the feedback was left.
     * @return the date.
     */
    public LocalDateTime getDate() {
        return date;
    }

    /**
     * Sets the date the feedback was left.
     * @param date the date to set.
     */
    public void setDate(LocalDateTime date) {
        this.date = date;
    }
}
