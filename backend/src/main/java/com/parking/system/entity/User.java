package com.parking.system.entity;

/**
 * Represents a user in the parking system.
 */
public class User {

    // Role constants
    public static final String ADMIN = "ADMIN";
    public static final String CUSTOMER = "CUSTOMER";

    private Long id;
    private String name;
    private String email;
    private String password;
    private String role;

    /**
     * Default constructor.
     */
    public User() {
    }

    /**
     * Full constructor.
     */
    public User(Long id, String name, String email, String password, String role) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.password = password;
        this.role = role;
    }

    /**
     * Gets user ID.
     */
    public Long getId() {
        return id;
    }

    /**
     * Sets user ID.
     */
    public void setId(Long id) {
        this.id = id;
    }

    /**
     * Gets user name.
     */
    public String getName() {
        return name;
    }

    /**
     * Sets user name.
     */
    public void setName(String name) {
        this.name = name;
    }

    /**
     * Gets user email.
     */
    public String getEmail() {
        return email;
    }

    /**
     * Sets user email.
     */
    public void setEmail(String email) {
        this.email = email;
    }

    /**
     * Gets user password.
     */
    public String getPassword() {
        return password;
    }

    /**
     * Sets user password.
     */
    public void setPassword(String password) {
        this.password = password;
    }

    /**
     * Gets user role.
     */
    public String getRole() {
        return role;
    }

    /**
     * Sets user role.
     * Allowed values:
     * ADMIN
     * CUSTOMER
     */
    public void setRole(String role) {
        this.role = role;
    }

    /**
     * Checks whether user is admin.
     */
    public boolean isAdmin() {
        return ADMIN.equalsIgnoreCase(this.role);
    }

    /**
     * Checks whether user is customer.
     */
    public boolean isCustomer() {
        return CUSTOMER.equalsIgnoreCase(this.role);
    }
}