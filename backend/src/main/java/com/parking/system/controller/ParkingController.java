package com.parking.system.controller;

import com.parking.system.dto.ParkingRecordDto;
import com.parking.system.dto.ParkingSlotDto;
import com.parking.system.entity.ParkingRecord;
import com.parking.system.entity.ParkingSlot;
import com.parking.system.service.ParkingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * REST Controller for Parking Slots and Records.
 */
@RestController
@RequestMapping("/api/parking")
public class ParkingController {

    private final ParkingService parkingService;

    @Autowired
    public ParkingController(ParkingService parkingService) {
        this.parkingService = parkingService;
    }

    private ParkingSlotDto mapSlotToDto(ParkingSlot slot) {
        ParkingSlotDto dto = new ParkingSlotDto();
        dto.setSlotNumber(slot.getSlotNumber());
        dto.setType(slot.getType());
        dto.setStatus(slot.getStatus());
        return dto;
    }

    private ParkingRecordDto mapRecordToDto(ParkingRecord record) {
        ParkingRecordDto dto = new ParkingRecordDto();
        dto.setId(record.getId());
        if (record.getVehicle() != null) {
            dto.setVehicleId(record.getVehicle().getId());
            dto.setVehiclePlateNumber(record.getVehicle().getPlateNumber());
        }
        if (record.getSlot() != null) {
            dto.setSlotNumber(record.getSlot().getSlotNumber());
        }
        dto.setEntryTime(record.getEntryTime());
        dto.setExitTime(record.getExitTime());
        dto.setFee(record.getFee());
        return dto;
    }

    // --- Slot Endpoints ---

    /**
     * Adds a new parking slot.
     * @param dto slot details.
     * @return saved slot DTO.
     */
    @PostMapping("/slots")
    public ResponseEntity<?> addSlot(@RequestBody ParkingSlotDto dto) {
        try {
            ParkingSlot slot = new ParkingSlot();
            slot.setSlotNumber(dto.getSlotNumber());
            slot.setType(dto.getType());
            ParkingSlot saved = parkingService.addSlot(slot);
            return ResponseEntity.ok(mapSlotToDto(saved));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Gets all parking slots.
     * @return list of all slot DTOs.
     */
    @GetMapping("/slots")
    public ResponseEntity<List<ParkingSlotDto>> getAllSlots() {
        List<ParkingSlotDto> dtos = parkingService.getAllSlots().stream()
                .map(this::mapSlotToDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    /**
     * Gets available parking slots.
     * @return list of available slot DTOs.
     */
    @GetMapping("/slots/available")
    public ResponseEntity<List<ParkingSlotDto>> getAvailableSlots() {
        List<ParkingSlotDto> dtos = parkingService.getAvailableSlots().stream()
                .map(this::mapSlotToDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    /**
     * Deletes a slot.
     * @param slotNumber the slot number.
     * @return success message.
     */
    @DeleteMapping("/slots/{slotNumber}")
    public ResponseEntity<?> deleteSlot(@PathVariable String slotNumber) {
        parkingService.deleteSlot(slotNumber);
        return ResponseEntity.ok(Map.of("message", "Slot deleted successfully"));
    }

    // --- Record Endpoints ---

    /**
     * Parks a vehicle.
     * @param dto DTO containing vehicleId and slotNumber.
     * @return the created parking record DTO.
     */
    @PostMapping("/park")
    public ResponseEntity<?> parkVehicle(@RequestBody ParkingRecordDto dto) {
        try {
            ParkingRecord record = parkingService.parkVehicle(dto.getVehicleId(), dto.getSlotNumber());
            return ResponseEntity.ok(mapRecordToDto(record));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Exits a parked vehicle.
     * @param vehicleId the vehicle ID.
     * @return the updated parking record DTO with fee.
     */
    @PostMapping("/exit/{vehicleId}")
    public ResponseEntity<?> exitVehicle(@PathVariable Long vehicleId) {
        try {
            ParkingRecord record = parkingService.exitVehicle(vehicleId);
            return ResponseEntity.ok(mapRecordToDto(record));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Gets parking history for a user.
     * @param userId the user ID.
     * @return list of record DTOs.
     */
    @GetMapping("/history/user/{userId}")
    public ResponseEntity<List<ParkingRecordDto>> getUserHistory(@PathVariable Long userId) {
        List<ParkingRecordDto> dtos = parkingService.getUserParkingHistory(userId).stream()
                .map(this::mapRecordToDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    /**
     * Gets all parking records.
     * @return list of all record DTOs.
     */
    @GetMapping("/history")
    public ResponseEntity<List<ParkingRecordDto>> getAllHistory() {
        List<ParkingRecordDto> dtos = parkingService.getAllRecords().stream()
                .map(this::mapRecordToDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    /**
     * Deletes a parking record by ID (Admin: remove old records).
     * @param id the record ID.
     * @return success message.
     */
    @DeleteMapping("/records/{id}")
    public ResponseEntity<?> deleteRecord(@PathVariable Long id) {
        parkingService.deleteRecord(id);
        return ResponseEntity.ok(Map.of("message", "Record deleted successfully"));
    }
}
