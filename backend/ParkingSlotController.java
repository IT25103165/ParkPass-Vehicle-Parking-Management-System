package com.parking.system.controller;

import com.parking.system.dto.ParkingSlotDto;
import com.parking.system.entity.ParkingSlot;
import com.parking.system.service.ParkingSlotService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/slots")
@CrossOrigin(origins = "*")
public class ParkingSlotController {

    private final ParkingSlotService parkingSlotService;

    @Autowired
    public ParkingSlotController(ParkingSlotService parkingSlotService) {
        this.parkingSlotService = parkingSlotService;
    }

    private ParkingSlotDto mapToDto(ParkingSlot slot) {
        ParkingSlotDto dto = new ParkingSlotDto();
        dto.setSlotNumber(slot.getSlotNumber());
        dto.setType(slot.getType());
        dto.setStatus(slot.getStatus());
        return dto;
    }

    @PostMapping
    public ResponseEntity<?> addSlot(@RequestBody ParkingSlotDto dto) {
        try {
            ParkingSlot saved = parkingSlotService.createSlotByType(
                    dto.getSlotNumber(),
                    dto.getType()
            );

            return ResponseEntity.ok(mapToDto(saved));

        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping
    public ResponseEntity<List<ParkingSlotDto>> getAllSlots() {
        List<ParkingSlotDto> dtos = parkingSlotService.getAllSlots().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());

        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/available")
    public ResponseEntity<List<ParkingSlotDto>> getAvailableSlots() {
        List<ParkingSlotDto> dtos = parkingSlotService.getAvailableSlots().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());

        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/{slotNumber}")
    public ResponseEntity<?> getSlotByNumber(@PathVariable String slotNumber) {
        try {
            ParkingSlot slot = parkingSlotService.getSlotByNumber(slotNumber);
            return ResponseEntity.ok(mapToDto(slot));

        } catch (Exception e) {
            return ResponseEntity.status(404)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{slotNumber}/status")
    public ResponseEntity<?> updateSlotStatus(
            @PathVariable String slotNumber,
            @RequestBody Map<String, String> body
    ) {
        try {
            ParkingSlot updated = parkingSlotService.updateSlotStatus(
                    slotNumber,
                    body.get("status")
            );

            return ResponseEntity.ok(mapToDto(updated));

        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{slotNumber}")
    public ResponseEntity<?> deleteSlot(@PathVariable String slotNumber) {
        try {
            parkingSlotService.deleteSlot(slotNumber);

            return ResponseEntity.ok(
                    Map.of("message", "Slot deleted successfully")
            );

        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        }
    }
}