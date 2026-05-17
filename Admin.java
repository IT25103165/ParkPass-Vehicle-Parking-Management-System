package com.parking.system.entity;

public class Admin extends User {

    private String adminCode;

    public Admin() {
        setRole("ADMIN");
    }

    public Admin(String adminCode) {
        setRole("ADMIN");
        this.adminCode = adminCode;
    }

    public String getAdminCode() {
        return adminCode;
    }

    public void setAdminCode(String adminCode) {
        this.adminCode = adminCode;
    }

    public boolean canManageUsers() {
        return true;
    }

    public boolean canDeleteCustomers() {
        return true;
    }

    public boolean canViewSystemDashboard() {
        return true;
    }
}