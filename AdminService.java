package com.parking.system.service;

import com.parking.system.entity.Admin;
import com.parking.system.entity.User;
import com.parking.system.util.FileHandler;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AdminService {

    private final FileHandler fileHandler;
    private final UserService userService;

    private static final String ADMIN = "ADMIN";
    private static final String CUSTOMER = "CUSTOMER";

    @Autowired
    public AdminService(FileHandler fileHandler, UserService userService) {
        this.fileHandler = fileHandler;
        this.userService = userService;
    }

    public void validateAdmin(Long adminId) {
        User admin = userService.getUserById(adminId);

        if (admin == null || admin.getRole() == null || !ADMIN.equalsIgnoreCase(admin.getRole())) {
            throw new RuntimeException("Access denied. Admin only.");
        }
    }

    public Admin registerAdmin(Long currentAdminId, Admin admin) {
        validateAdmin(currentAdminId);

        if (admin.getName() == null || admin.getName().isBlank()) {
            throw new RuntimeException("Admin name is required");
        }

        if (admin.getEmail() == null || admin.getEmail().isBlank()) {
            throw new RuntimeException("Admin email is required");
        }

        if (admin.getPassword() == null || admin.getPassword().isBlank()) {
            throw new RuntimeException("Admin password is required");
        }

        if (admin.getAdminCode() == null || admin.getAdminCode().isBlank()) {
            throw new RuntimeException("Admin code is required");
        }

        boolean emailExists = fileHandler.getAllUsers().stream()
                .anyMatch(user -> user.getEmail().equalsIgnoreCase(admin.getEmail()));

        if (emailExists) {
            throw new RuntimeException("Email already in use");
        }

        admin.setRole(ADMIN);
        fileHandler.saveUser(admin);

        return admin;
    }

    public List<User> getAllAdmins(Long adminId) {
        validateAdmin(adminId);

        return fileHandler.getAllUsers().stream()
                .filter(user -> ADMIN.equalsIgnoreCase(user.getRole()))
                .toList();
    }

    public List<User> getAllCustomers(Long adminId) {
        validateAdmin(adminId);

        return fileHandler.getAllUsers().stream()
                .filter(user -> CUSTOMER.equalsIgnoreCase(user.getRole()))
                .toList();
    }

    public List<User> getAllUsers(Long adminId) {
        validateAdmin(adminId);

        return fileHandler.getAllUsers();
    }

    public User updateAdmin(Long currentAdminId, Long targetAdminId, String name, String email, String password) {
        validateAdmin(currentAdminId);

        User targetAdmin = userService.getUserById(targetAdminId);

        if (!ADMIN.equalsIgnoreCase(targetAdmin.getRole())) {
            throw new RuntimeException("Selected user is not an admin");
        }

        if (name != null && !name.isBlank()) {
            targetAdmin.setName(name);
        }

        if (email != null && !email.isBlank()) {
            targetAdmin.setEmail(email);
        }

        if (password != null && !password.isBlank()) {
            targetAdmin.setPassword(password);
        }

        targetAdmin.setRole(ADMIN);
        fileHandler.saveUser(targetAdmin);

        return targetAdmin;
    }

    public void deleteAdmin(Long currentAdminId, Long targetAdminId) {
        validateAdmin(currentAdminId);

        if (currentAdminId.equals(targetAdminId)) {
            throw new RuntimeException("You cannot delete your own admin account");
        }

        User targetAdmin = userService.getUserById(targetAdminId);

        if (!ADMIN.equalsIgnoreCase(targetAdmin.getRole())) {
            throw new RuntimeException("Selected user is not an admin");
        }

        long adminCount = fileHandler.getAllUsers().stream()
                .filter(user -> ADMIN.equalsIgnoreCase(user.getRole()))
                .count();

        if (adminCount <= 1) {
            throw new RuntimeException("At least one admin account must remain");
        }

        fileHandler.deleteUser(targetAdminId);
    }

    public void deleteCustomer(Long adminId, Long customerId) {
        validateAdmin(adminId);

        User customer = userService.getUserById(customerId);

        if (!CUSTOMER.equalsIgnoreCase(customer.getRole())) {
            throw new RuntimeException("Admins can only delete customer accounts");
        }

        fileHandler.deleteUser(customerId);
    }

    public long countAdmins(Long adminId) {
        return getAllAdmins(adminId).size();
    }

    public long countCustomers(Long adminId) {
        return getAllCustomers(adminId).size();
    }

    public long countVehicles(Long adminId) {
        validateAdmin(adminId);
        return fileHandler.getAllVehicles().size();
    }

    public long countSlots(Long adminId) {
        validateAdmin(adminId);
        return fileHandler.getAllSlots().size();
    }

    public long countRecords(Long adminId) {
        validateAdmin(adminId);
        return fileHandler.getAllRecords().size();
    }

    public long countFeedback(Long adminId) {
        validateAdmin(adminId);
        return fileHandler.getAllFeedback().size();
    }
}