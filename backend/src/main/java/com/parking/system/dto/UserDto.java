package com.parking.system.dto;

/**
 * DTO for transferring user data.
 */
public class UserDto {

    private Long id;
    private String name;
    private String email;
    private String password;
    private String role;

    // Role constants
    public static final String ADMIN = "ADMIN";
    public static final String CUSTOMER = "CUSTOMER";

    /**
     * Default constructor.
     */
    public UserDto() {
    }

    /**
     * Full constructor.
     */
    public UserDto(Long id, String name, String email, String password, String role) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.password = password;
        this.role = role;
    }

    // Getters and Setters

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    /**
     * Password should only be used internally.
     */
    public String getPassword() {
        return password;
    }

    /**
     * Password should only be used internally.
     */
    public void setPassword(String password) {
        this.password = password;
    }

    /**
     * Gets user role.
     * ADMIN or CUSTOMER
     */
    public String getRole() {
        return role;
    }

    /**
     * Sets user role.
     * ADMIN or CUSTOMER
     */
    public void setRole(String role) {
        this.role = role;
    }
}