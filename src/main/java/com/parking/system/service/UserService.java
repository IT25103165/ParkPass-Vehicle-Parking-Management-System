package com.parking.system.service;

import com.parking.system.entity.User;
import com.parking.system.util.FileHandler;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class UserService {

    private final FileHandler fileHandler;

    private static final String ADMIN = "ADMIN";
    private static final String CUSTOMER = "CUSTOMER";

    @Autowired
    public UserService(FileHandler fileHandler) {
        this.fileHandler = fileHandler;
    }

    public User registerUser(User user) {
        if (user.getEmail() == null || user.getEmail().isBlank()) {
            throw new RuntimeException("Email is required");
        }

        if (user.getPassword() == null || user.getPassword().isBlank()) {
            throw new RuntimeException("Password is required");
        }

        if (fileHandler.getAllUsers().stream()
                .anyMatch(u -> u.getEmail().equalsIgnoreCase(user.getEmail()))) {
            throw new RuntimeException("Email already in use");
        }

        if (user.getRole() == null || user.getRole().isBlank()) {
            user.setRole(CUSTOMER);
        } else {
            user.setRole(user.getRole().toUpperCase());
        }

        if (!user.getRole().equals(ADMIN) && !user.getRole().equals(CUSTOMER)) {
            throw new RuntimeException("Invalid role. Role must be ADMIN or CUSTOMER");
        }

        fileHandler.saveUser(user);
        return user;
    }

    public User login(String email, String password) {
        Optional<User> userOpt = fileHandler.getAllUsers().stream()
                .filter(u -> u.getEmail().equalsIgnoreCase(email))
                .findFirst();

        if (userOpt.isPresent() && userOpt.get().getPassword().equals(password)) {
            return userOpt.get();
        }

        throw new RuntimeException("Invalid credentials");
    }

    public List<User> getAllUsers() {
        return fileHandler.getAllUsers();
    }

    public List<User> getAllCustomers() {
        return fileHandler.getAllUsers().stream()
                .filter(user -> CUSTOMER.equalsIgnoreCase(user.getRole()))
                .toList();
    }

    public List<User> getAllAdmins() {
        return fileHandler.getAllUsers().stream()
                .filter(user -> ADMIN.equalsIgnoreCase(user.getRole()))
                .toList();
    }

    public User getUserById(Long id) {
        return fileHandler.getAllUsers().stream()
                .filter(u -> u.getId().equals(id))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public void validateAdmin(Long adminId) {
        User admin = getUserById(adminId);

        if (!ADMIN.equalsIgnoreCase(admin.getRole())) {
            throw new RuntimeException("Access denied. Admin only.");
        }
    }

    public User updateUser(Long id, String name, String email, String role, String password) {
        User user = getUserById(id);

        if (name != null && !name.isBlank()) {
            user.setName(name);
        }

        if (email != null && !email.isBlank()) {
            user.setEmail(email);
        }

        if (role != null && !role.isBlank()) {
            String updatedRole = role.toUpperCase();

            if (!updatedRole.equals(ADMIN) && !updatedRole.equals(CUSTOMER)) {
                throw new RuntimeException("Invalid role. Role must be ADMIN or CUSTOMER");
            }

            user.setRole(updatedRole);
        }

        if (password != null && !password.isBlank()) {
            user.setPassword(password);
        }

        fileHandler.saveUser(user);
        return user;
    }

    public void deleteCustomerByAdmin(Long adminId, Long customerId) {
        validateAdmin(adminId);

        User customer = getUserById(customerId);

        if (!CUSTOMER.equalsIgnoreCase(customer.getRole())) {
            throw new RuntimeException("Admins can only delete customer accounts");
        }

        fileHandler.deleteUser(customerId);
    }
}