package com.parking.system.controller;

import com.parking.system.dto.VehicleDto;
import com.parking.system.entity.User;
import com.parking.system.entity.Vehicle;
import com.parking.system.service.UserService;
import com.parking.system.service.VehicleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/vehicles")
@CrossOrigin(origins = "*")
public class VehicleController {

    private final VehicleService vehicleService;
    private final UserService userService;

    @Autowired
    public VehicleController(VehicleService vehicleService, UserService userService) {
        this.vehicleService = vehicleService;
        this.userService = userService;
    }

    private VehicleDto mapToDto(Vehicle vehicle) {
        VehicleDto dto = new VehicleDto();
        dto.setId(vehicle.getId());
        dto.setPlateNumber(vehicle.getPlateNumber());
        dto.setType(vehicle.getType());
        dto.setBrand(vehicle.getBrand());

        if (vehicle.getOwner() != null) {
            dto.setOwnerId(vehicle.getOwner().getId());
            dto.setOwnerName(vehicle.getOwner().getName());
        }

        return dto;
    }

    @PostMapping
    public ResponseEntity<?> addVehicle(@RequestBody VehicleDto dto) {
        try {
            User owner = userService.getUserById(dto.getOwnerId());

            Vehicle vehicle = new Vehicle();
            vehicle.setPlateNumber(dto.getPlateNumber());
            vehicle.setType(dto.getType());
            vehicle.setBrand(dto.getBrand());
            vehicle.setOwner(owner);

            Vehicle saved = vehicleService.addVehicle(vehicle);
            return ResponseEntity.ok(mapToDto(saved));

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/user/{ownerId}")
    public ResponseEntity<List<VehicleDto>> getVehiclesByOwner(@PathVariable Long ownerId) {
        List<VehicleDto> dtos = vehicleService.getVehiclesByOwner(ownerId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());

        return ResponseEntity.ok(dtos);
    }

    @GetMapping
    public ResponseEntity<List<VehicleDto>> getAllVehicles() {
        List<VehicleDto> dtos = vehicleService.getAllVehicles().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());

        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getVehicleById(@PathVariable Long id) {
        try {
            Vehicle vehicle = vehicleService.getVehicleById(id);
            return ResponseEntity.ok(mapToDto(vehicle));
        } catch (Exception e) {
            return ResponseEntity.status(404).body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateVehicle(@PathVariable Long id, @RequestBody VehicleDto dto) {
        try {
            Vehicle updated = new Vehicle();
            updated.setPlateNumber(dto.getPlateNumber());
            updated.setBrand(dto.getBrand());
            updated.setType(dto.getType());

            Vehicle saved = vehicleService.updateVehicle(id, updated);
            return ResponseEntity.ok(mapToDto(saved));

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/customer/{customerId}/{vehicleId}")
    public ResponseEntity<?> updateVehicleByCustomer(
            @PathVariable Long customerId,
            @PathVariable Long vehicleId,
            @RequestBody VehicleDto dto
    ) {
        try {
            Vehicle updated = new Vehicle();
            updated.setPlateNumber(dto.getPlateNumber());
            updated.setBrand(dto.getBrand());
            updated.setType(dto.getType());

            Vehicle saved = vehicleService.updateVehicleByCustomer(customerId, vehicleId, updated);
            return ResponseEntity.ok(mapToDto(saved));

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteVehicle(@PathVariable Long id) {
        try {
            vehicleService.deleteVehicle(id);
            return ResponseEntity.ok(Map.of("message", "Vehicle deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}