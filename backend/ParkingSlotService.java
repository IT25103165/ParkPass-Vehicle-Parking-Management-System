package com.parking.system.service;

import com.parking.system.entity.BikeSlot;
import com.parking.system.entity.CarSlot;
import com.parking.system.entity.ParkingSlot;
import com.parking.system.util.FileHandler;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ParkingSlotService {

    private final FileHandler fileHandler;

    @Autowired
    public ParkingSlotService(FileHandler fileHandler) {
        this.fileHandler = fileHandler;
    }

    public ParkingSlot addSlot(ParkingSlot slot) {
        if (slot.getSlotNumber() == null || slot.getSlotNumber().isBlank()) {
            throw new RuntimeException("Slot number is required");
        }

        if (slot.getType() == null || slot.getType().isBlank()) {
            throw new RuntimeException("Slot type is required");
        }

        boolean exists = fileHandler.getAllSlots().stream()
                .anyMatch(s -> s.getSlotNumber().equalsIgnoreCase(slot.getSlotNumber()));

        if (exists) {
            throw new RuntimeException("Slot already exists");
        }

        slot.setStatus("AVAILABLE");
        fileHandler.saveSlot(slot);
        return slot;
    }

    public ParkingSlot createSlotByType(String slotNumber, String type) {
        ParkingSlot slot;

        if ("Bike".equalsIgnoreCase(type)) {
            slot = new BikeSlot();
        } else {
            slot = new CarSlot();
        }

        slot.setSlotNumber(slotNumber);
        slot.setType(type);
        slot.setStatus("AVAILABLE");

        return addSlot(slot);
    }

    public List<ParkingSlot> getAllSlots() {
        return fileHandler.getAllSlots();
    }

    public List<ParkingSlot> getAvailableSlots() {
        return fileHandler.getAllSlots().stream()
                .filter(slot -> "AVAILABLE".equalsIgnoreCase(slot.getStatus()))
                .collect(Collectors.toList());
    }

    public ParkingSlot getSlotByNumber(String slotNumber) {
        return fileHandler.getAllSlots().stream()
                .filter(slot -> slot.getSlotNumber().equalsIgnoreCase(slotNumber))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Slot not found"));
    }

    public ParkingSlot updateSlotStatus(String slotNumber, String status) {
        ParkingSlot slot = getSlotByNumber(slotNumber);

        if (status == null || status.isBlank()) {
            throw new RuntimeException("Status is required");
        }

        slot.setStatus(status.toUpperCase());
        fileHandler.saveSlot(slot);

        return slot;
    }

    public void deleteSlot(String slotNumber) {
        ParkingSlot slot = getSlotByNumber(slotNumber);
        fileHandler.deleteSlot(slot.getSlotNumber());
    }
}