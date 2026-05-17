package com.parking.system.controller;

import com.parking.system.dto.AdminDto;
import com.parking.system.dto.UserDto;
import com.parking.system.entity.Admin;
import com.parking.system.entity.User;
import com.parking.system.service.AdminService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*")
public class AdminController {

    private final AdminService adminService;

    @Autowired
    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    private UserDto mapToUserDto(User user) {
        UserDto dto = new UserDto();

        dto.setId(user.getId());
        dto.setName(user.getName());
        dto.setEmail(user.getEmail());
        dto.setRole(user.getRole());

        return dto;
    }

    private AdminDto mapToAdminDto(User user) {
        AdminDto dto = new AdminDto();

        dto.setId(user.getId());
        dto.setName(user.getName());
        dto.setEmail(user.getEmail());
        dto.setRole(user.getRole());

        return dto;
    }

    @GetMapping("/{adminId}/dashboard")
    public ResponseEntity<?> getAdminDashboard(@PathVariable Long adminId) {
        try {
            Map<String, Object> dashboard = Map.of(
                    "totalAdmins", adminService.countAdmins(adminId),
                    "totalCustomers", adminService.countCustomers(adminId),
                    "totalVehicles", adminService.countVehicles(adminId),
                    "totalSlots", adminService.countSlots(adminId),
                    "totalRecords", adminService.countRecords(adminId),
                    "totalFeedback", adminService.countFeedback(adminId),

                    "admins", adminService.getAllAdmins(adminId).stream()
                            .map(this::mapToAdminDto)
                            .collect(Collectors.toList()),

                    "customers", adminService.getAllCustomers(adminId).stream()
                            .map(this::mapToUserDto)
                            .collect(Collectors.toList()),

                    "allUsers", adminService.getAllUsers(adminId).stream()
                            .map(this::mapToUserDto)
                            .collect(Collectors.toList())
            );

            return ResponseEntity.ok(dashboard);

        } catch (Exception e) {
            return ResponseEntity.status(403).body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/{adminId}/register")
    public ResponseEntity<?> registerAdmin(
            @PathVariable Long adminId,
            @RequestBody AdminDto dto
    ) {
        try {
            Admin admin = new Admin();

            admin.setName(dto.getName());
            admin.setEmail(dto.getEmail());
            admin.setPassword(dto.getPassword());
            admin.setRole("ADMIN");
            admin.setAdminCode(dto.getAdminCode());

            Admin saved = adminService.registerAdmin(adminId, admin);

            return ResponseEntity.ok(mapToAdminDto(saved));

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/{adminId}/admins")
    public ResponseEntity<?> getAdmins(@PathVariable Long adminId) {
        try {
            return ResponseEntity.ok(
                    adminService.getAllAdmins(adminId).stream()
                            .map(this::mapToAdminDto)
                            .collect(Collectors.toList())
            );

        } catch (Exception e) {
            return ResponseEntity.status(403).body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/{adminId}/customers")
    public ResponseEntity<?> getCustomers(@PathVariable Long adminId) {
        try {
            return ResponseEntity.ok(
                    adminService.getAllCustomers(adminId).stream()
                            .map(this::mapToUserDto)
                            .collect(Collectors.toList())
            );

        } catch (Exception e) {
            return ResponseEntity.status(403).body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{adminId}/admins/{targetAdminId}")
    public ResponseEntity<?> updateAdmin(
            @PathVariable Long adminId,
            @PathVariable Long targetAdminId,
            @RequestBody AdminDto dto
    ) {
        try {
            User updated = adminService.updateAdmin(
                    adminId,
                    targetAdminId,
                    dto.getName(),
                    dto.getEmail(),
                    dto.getPassword()
            );

            return ResponseEntity.ok(mapToAdminDto(updated));

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{adminId}/admins/{targetAdminId}")
    public ResponseEntity<?> deleteAdmin(
            @PathVariable Long adminId,
            @PathVariable Long targetAdminId
    ) {
        try {
            adminService.deleteAdmin(adminId, targetAdminId);

            return ResponseEntity.ok(Map.of("message", "Admin deleted successfully"));

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{adminId}/customers/{customerId}")
    public ResponseEntity<?> deleteCustomer(
            @PathVariable Long adminId,
            @PathVariable Long customerId
    ) {
        try {
            adminService.deleteCustomer(adminId, customerId);

            return ResponseEntity.ok(Map.of("message", "Customer deleted successfully"));

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}