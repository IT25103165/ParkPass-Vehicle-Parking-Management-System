package com.parking.system.controller;

import com.parking.system.dto.ParkingRecordDto;
import com.parking.system.entity.ParkingRecord;
import com.parking.system.service.ParkingRecordService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/records")
@CrossOrigin(origins = "*")
public class ParkingRecordController {

    private final ParkingRecordService parkingRecordService;

    @Autowired
    public ParkingRecordController(ParkingRecordService parkingRecordService) {
        this.parkingRecordService = parkingRecordService;
    }

    private ParkingRecordDto mapToDto(ParkingRecord record) {
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

    @PostMapping("/park")
    public ResponseEntity<?> parkVehicle(@RequestBody ParkingRecordDto dto) {
        try {
            ParkingRecord record = parkingRecordService.parkVehicle(
                    dto.getVehicleId(),
                    dto.getSlotNumber()
            );

            return ResponseEntity.ok(mapToDto(record));

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/exit/{vehicleId}")
    public ResponseEntity<?> exitVehicle(@PathVariable Long vehicleId) {
        try {
            ParkingRecord record = parkingRecordService.exitVehicle(vehicleId);
            return ResponseEntity.ok(mapToDto(record));

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping
    public ResponseEntity<List<ParkingRecordDto>> getAllRecords() {
        List<ParkingRecordDto> dtos = parkingRecordService.getAllRecords().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());

        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getRecordById(@PathVariable Long id) {
        try {
            ParkingRecord record = parkingRecordService.getRecordById(id);
            return ResponseEntity.ok(mapToDto(record));

        } catch (Exception e) {
            return ResponseEntity.status(404).body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<ParkingRecordDto>> getUserHistory(@PathVariable Long userId) {
        List<ParkingRecordDto> dtos = parkingRecordService.getUserParkingHistory(userId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());

        return ResponseEntity.ok(dtos);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteRecord(@PathVariable Long id) {
        try {
            parkingRecordService.deleteRecord(id);
            return ResponseEntity.ok(Map.of("message", "Parking record deleted successfully"));

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}