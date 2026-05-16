package com.parking.system.entity;

import java.time.LocalDateTime;


public class Feedback {

    private Long id;
    private User user;
    private String message;
    private Integer rating; // 1 to 5 stars
    private LocalDateTime date;


    public Feedback() {
    }


    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }


    public User getUser() {
        return user;
    }


    public void setUser(User user) {
        this.user = user;
    }


    public String getMessage() {
        return message;
    }


    public void setMessage(String message) {
        this.message = message;
    }


    public Integer getRating() {
        return rating;
    }


    public void setRating(Integer rating) {
        this.rating = rating;
    }

    
    public LocalDateTime getDate() {
        return date;
    }


    public void setDate(LocalDateTime date) {
        this.date = date;
    }
}
