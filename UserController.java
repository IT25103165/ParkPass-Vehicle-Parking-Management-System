package com.parking.system.controller;

import com.parking.system.dto.UserDto;
import com.parking.system.entity.User;
import com.parking.system.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class UserController {

    private final UserService userService;

    @Autowired
    public UserController(UserService userService) {
        this.userService = userService;
    }

    private UserDto mapToDto(User user) {
        UserDto dto = new UserDto();
        dto.setId(user.getId());
        dto.setName(user.getName());
        dto.setEmail(user.getEmail());
        dto.setRole(user.getRole());
        return dto;
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody UserDto userDto) {
        try {
            User user = new User();
            user.setName(userDto.getName());
            user.setEmail(userDto.getEmail());
            user.setPassword(userDto.getPassword());
            user.setRole(userDto.getRole());

            User saved = userService.registerUser(user);
            return ResponseEntity.ok(mapToDto(saved));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> credentials) {
        try {
            User user = userService.login(
                    credentials.get("email"),
                    credentials.get("password")
            );

            return ResponseEntity.ok(mapToDto(user));
        } catch (Exception e) {
            return ResponseEntity.status(401).body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping
    public ResponseEntity<List<UserDto>> getAllUsers() {
        List<UserDto> dtos = userService.getAllUsers().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());

        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getUserById(@PathVariable Long id) {
        try {
            User user = userService.getUserById(id);
            return ResponseEntity.ok(mapToDto(user));
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateUser(@PathVariable Long id, @RequestBody UserDto userDto) {
        try {
            User updated = userService.updateUser(
                    id,
                    userDto.getName(),
                    userDto.getEmail(),
                    userDto.getRole(),
                    userDto.getPassword()
            );

            return ResponseEntity.ok(mapToDto(updated));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Admin dashboard: returns both admins and customers
    @GetMapping("/admin/{adminId}/dashboard")
    public ResponseEntity<?> getAdminDashboard(@PathVariable Long adminId) {
        try {
            userService.validateAdmin(adminId);

            Map<String, Object> dashboard = Map.of(
                    "admins", userService.getAllAdmins().stream()
                            .map(this::mapToDto)
                            .collect(Collectors.toList()),

                    "customers", userService.getAllCustomers().stream()
                            .map(this::mapToDto)
                            .collect(Collectors.toList())
            );

            return ResponseEntity.ok(dashboard);
        } catch (Exception e) {
            return ResponseEntity.status(403).body(Map.of("error", e.getMessage()));
        }
    }

    // Admin can view all customers
    @GetMapping("/admin/{adminId}/customers")
    public ResponseEntity<?> getCustomersForAdmin(@PathVariable Long adminId) {
        try {
            userService.validateAdmin(adminId);

            List<UserDto> customers = userService.getAllCustomers().stream()
                    .map(this::mapToDto)
                    .collect(Collectors.toList());

            return ResponseEntity.ok(customers);
        } catch (Exception e) {
            return ResponseEntity.status(403).body(Map.of("error", e.getMessage()));
        }
    }

    // Admin can view all admins
    @GetMapping("/admin/{adminId}/admins")
    public ResponseEntity<?> getAdminsForAdmin(@PathVariable Long adminId) {
        try {
            userService.validateAdmin(adminId);

            List<UserDto> admins = userService.getAllAdmins().stream()
                    .map(this::mapToDto)
                    .collect(Collectors.toList());

            return ResponseEntity.ok(admins);
        } catch (Exception e) {
            return ResponseEntity.status(403).body(Map.of("error", e.getMessage()));
        }
    }

    // Admin deletes a customer
    @DeleteMapping("/admin/{adminId}/delete-customer/{customerId}")
    public ResponseEntity<?> deleteCustomerByAdmin(
            @PathVariable Long adminId,
            @PathVariable Long customerId
    ) {
        try {
            userService.deleteCustomerByAdmin(adminId, customerId);
            return ResponseEntity.ok(Map.of("message", "Customer deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}