package com.parking.system.service;

import com.parking.system.entity.Vehicle;
import com.parking.system.util.FileHandler;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class VehicleService {

    private final FileHandler fileHandler;

    @Autowired
    public VehicleService(FileHandler fileHandler) {
        this.fileHandler = fileHandler;
    }

    public Vehicle addVehicle(Vehicle vehicle) {
        if (vehicle.getPlateNumber() == null || vehicle.getPlateNumber().isBlank()) {
            throw new RuntimeException("Plate number is required");
        }

        if (vehicle.getType() == null || vehicle.getType().isBlank()) {
            throw new RuntimeException("Vehicle type is required");
        }

        if (vehicle.getBrand() == null || vehicle.getBrand().isBlank()) {
            throw new RuntimeException("Vehicle brand is required");
        }

        if (vehicle.getOwner() == null) {
            throw new RuntimeException("Vehicle owner is required");
        }

        boolean plateExists = fileHandler.getAllVehicles().stream()
                .anyMatch(v -> v.getPlateNumber().equalsIgnoreCase(vehicle.getPlateNumber()));

        if (plateExists) {
            throw new RuntimeException("Vehicle with this plate number already exists");
        }

        fileHandler.saveVehicle(vehicle);
        return vehicle;
    }

    public List<Vehicle> getVehiclesByOwner(Long ownerId) {
        return fileHandler.getAllVehicles().stream()
                .filter(v -> v.getOwner() != null && v.getOwner().getId().equals(ownerId))
                .collect(Collectors.toList());
    }

    public List<Vehicle> getAllVehicles() {
        return fileHandler.getAllVehicles();
    }

    public Vehicle getVehicleById(Long id) {
        return fileHandler.getAllVehicles().stream()
                .filter(v -> v.getId().equals(id))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Vehicle not found"));
    }

    public Vehicle updateVehicle(Long id, Vehicle updated) {
        Vehicle existing = getVehicleById(id);

        if (updated.getPlateNumber() != null && !updated.getPlateNumber().isBlank()) {
            boolean plateExists = fileHandler.getAllVehicles().stream()
                    .anyMatch(v ->
                            !v.getId().equals(id) &&
                                    v.getPlateNumber().equalsIgnoreCase(updated.getPlateNumber())
                    );

            if (plateExists) {
                throw new RuntimeException("Another vehicle already uses this plate number");
            }

            existing.setPlateNumber(updated.getPlateNumber());
        }

        if (updated.getBrand() != null && !updated.getBrand().isBlank()) {
            existing.setBrand(updated.getBrand());
        }

        if (updated.getType() != null && !updated.getType().isBlank()) {
            existing.setType(updated.getType());
        }

        fileHandler.saveVehicle(existing);
        return existing;
    }

    public Vehicle updateVehicleByCustomer(Long customerId, Long vehicleId, Vehicle updated) {
        Vehicle existing = getVehicleById(vehicleId);

        if (existing.getOwner() == null || !existing.getOwner().getId().equals(customerId)) {
            throw new RuntimeException("You can only update your own vehicles");
        }

        return updateVehicle(vehicleId, updated);
    }

    public void deleteVehicle(Long id) {
        fileHandler.deleteVehicle(id);
    }
}