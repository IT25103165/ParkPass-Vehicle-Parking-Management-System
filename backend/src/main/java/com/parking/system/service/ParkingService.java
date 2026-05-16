package com.parking.system.service;

import com.parking.system.entity.ParkingRecord;
import com.parking.system.entity.ParkingSlot;
import com.parking.system.entity.Vehicle;
import com.parking.system.util.FileHandler;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Service for handling Parking slots, records, and fee calculations using FileHandler.
 */
@Service
public class ParkingService {

    private final FileHandler fileHandler;
    private final VehicleService vehicleService;

    @Autowired
    public ParkingService(FileHandler fileHandler, VehicleService vehicleService) {
        this.fileHandler = fileHandler;
        this.vehicleService = vehicleService;
    }

    // --- Slot Management ---

    /**
     * Adds a new parking slot to the system.
     * @param slot the slot to add.
     * @return the saved slot.
     */
    public ParkingSlot addSlot(ParkingSlot slot) {
        if (fileHandler.getAllSlots().stream().anyMatch(s -> s.getSlotNumber().equals(slot.getSlotNumber()))) {
            throw new RuntimeException("Slot number already exists");
        }
        slot.setStatus("AVAILABLE");
        fileHandler.saveSlot(slot);
        return slot;
    }

    /**
     * Retrieves all parking slots.
     * @return a list of all slots.
     */
    public List<ParkingSlot> getAllSlots() {
        return fileHandler.getAllSlots();
    }

    /**
     * Retrieves all available parking slots.
     * @return a list of available slots.
     */
    public List<ParkingSlot> getAvailableSlots() {
        return fileHandler.getAllSlots().stream()
                .filter(s -> "AVAILABLE".equals(s.getStatus()))
                .collect(Collectors.toList());
    }
    
    /**
     * Deletes a parking slot by slot number.
     * @param slotNumber the slot number.
     */
    public void deleteSlot(String slotNumber) {
        fileHandler.deleteSlot(slotNumber);
    }

    // --- Parking Operations ---

    /**
     * Parks a vehicle in a specific slot.
     * @param vehicleId the ID of the vehicle.
     * @param slotNumber the slot number to park in.
     * @return the created ParkingRecord.
     */
    public ParkingRecord parkVehicle(Long vehicleId, String slotNumber) {
        // Check if vehicle is already parked
        if (fileHandler.getAllRecords().stream().anyMatch(r -> r.getVehicle().getId().equals(vehicleId) && r.getExitTime() == null)) {
            throw new RuntimeException("Vehicle is already parked");
        }

        Vehicle vehicle = vehicleService.getVehicleById(vehicleId);
        ParkingSlot slot = fileHandler.getAllSlots().stream()
                .filter(s -> s.getSlotNumber().equals(slotNumber))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Slot not found"));

        if (!"AVAILABLE".equals(slot.getStatus())) {
            throw new RuntimeException("Slot is not available");
        }

        // Mark slot as occupied
        slot.setStatus("OCCUPIED");
        fileHandler.saveSlot(slot);

        // Create record
        ParkingRecord record = new ParkingRecord();
        record.setVehicle(vehicle);
        record.setSlot(slot);
        record.setEntryTime(LocalDateTime.now());
        
        fileHandler.saveRecord(record);
        return record;
    }

    /**
     * Processes a vehicle exiting the parking lot and calculates the fee.
     * @param vehicleId the ID of the vehicle.
     * @return the updated ParkingRecord with fee.
     */
    public ParkingRecord exitVehicle(Long vehicleId) {
        ParkingRecord record = fileHandler.getAllRecords().stream()
                .filter(r -> r.getVehicle().getId().equals(vehicleId) && r.getExitTime() == null)
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Active parking record not found for this vehicle"));

        record.setExitTime(LocalDateTime.now());
        
        // Calculate Fee: Rs. 50 per hour
        Duration duration = Duration.between(record.getEntryTime(), record.getExitTime());
        long minutes = duration.toMinutes();
        double hours = Math.ceil(minutes / 60.0);
        if (hours == 0) hours = 1; // Minimum 1 hour charge
        
        double fee = hours * 50.0;
        record.setFee(fee);

        // Free the slot
        ParkingSlot slot = record.getSlot();
        slot.setStatus("AVAILABLE");
        fileHandler.saveSlot(slot);

        fileHandler.saveRecord(record);
        return record;
    }

    /**
     * Retrieves parking history for a specific user.
     * @param userId the user ID.
     * @return a list of records.
     */
    public List<ParkingRecord> getUserParkingHistory(Long userId) {
        return fileHandler.getAllRecords().stream()
                .filter(r -> r.getVehicle().getOwner().getId().equals(userId))
                .collect(Collectors.toList());
    }

    /**
     * Retrieves all parking records (for Admin).
     * @return a list of all records.
     */
    public List<ParkingRecord> getAllRecords() {
        return fileHandler.getAllRecords();
    }

    /**
     * Deletes a parking record by ID (Admin: remove old records).
     * @param id the record ID.
     */
    public void deleteRecord(Long id) {
        fileHandler.deleteRecord(id);
    }
}
