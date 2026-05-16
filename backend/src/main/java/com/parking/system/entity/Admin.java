package com.parking.system.entity;

public class Admin extends User {
    private String adminCode;

    public Admin() {
        setRole("ADMIN");
    }

    public String getAdminCode() {
        return adminCode;
    }

    public void setAdminCode(String adminCode) {
        this.adminCode = adminCode;
    }
}
