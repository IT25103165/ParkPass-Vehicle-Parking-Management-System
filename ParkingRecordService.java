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
import java.util.stream.Collectors;

@Service
public class ParkingRecordService {

    private final FileHandler fileHandler;
    private final VehicleService vehicleService;
    private final ParkingSlotService parkingSlotService;

    @Autowired
    public ParkingRecordService(
            FileHandler fileHandler,
            VehicleService vehicleService,
            ParkingSlotService parkingSlotService
    ) {
        this.fileHandler = fileHandler;
        this.vehicleService = vehicleService;
        this.parkingSlotService = parkingSlotService;
    }

    public ParkingRecord parkVehicle(Long vehicleId, String slotNumber) {
        boolean alreadyParked = fileHandler.getAllRecords().stream()
                .anyMatch(record ->
                        record.getVehicle() != null &&
                                record.getVehicle().getId().equals(vehicleId) &&
                                record.getExitTime() == null
                );

        if (alreadyParked) {
            throw new RuntimeException("Vehicle is already parked");
        }

        Vehicle vehicle = vehicleService.getVehicleById(vehicleId);
        ParkingSlot slot = parkingSlotService.getSlotByNumber(slotNumber);

        if (!"AVAILABLE".equalsIgnoreCase(slot.getStatus())) {
            throw new RuntimeException("Slot is not available");
        }

        slot.setStatus("OCCUPIED");
        fileHandler.saveSlot(slot);

        ParkingRecord record = new ParkingRecord();
        record.setVehicle(vehicle);
        record.setSlot(slot);
        record.setEntryTime(LocalDateTime.now());
        record.setExitTime(null);
        record.setFee(null);

        fileHandler.saveRecord(record);
        return record;
    }

    public ParkingRecord exitVehicle(Long vehicleId) {
        ParkingRecord record = fileHandler.getAllRecords().stream()
                .filter(r ->
                        r.getVehicle() != null &&
                                r.getVehicle().getId().equals(vehicleId) &&
                                r.getExitTime() == null
                )
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Active parking record not found"));

        record.setExitTime(LocalDateTime.now());

        Duration duration = Duration.between(record.getEntryTime(), record.getExitTime());
        long minutes = duration.toMinutes();

        double hours = Math.ceil(minutes / 60.0);

        if (hours == 0) {
            hours = 1;
        }

        double fee = hours * 50.0;
        record.setFee(fee);

        ParkingSlot slot = record.getSlot();
        slot.setStatus("AVAILABLE");
        fileHandler.saveSlot(slot);

        fileHandler.saveRecord(record);
        return record;
    }

    public List<ParkingRecord> getAllRecords() {
        return fileHandler.getAllRecords();
    }

    public List<ParkingRecord> getUserParkingHistory(Long userId) {
        return fileHandler.getAllRecords().stream()
                .filter(record ->
                        record.getVehicle() != null &&
                                record.getVehicle().getOwner() != null &&
                                record.getVehicle().getOwner().getId().equals(userId)
                )
                .collect(Collectors.toList());
    }

    public ParkingRecord getRecordById(Long id) {
        return fileHandler.getAllRecords().stream()
                .filter(record -> record.getId().equals(id))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Parking record not found"));
    }

    public void deleteRecord(Long id) {
        ParkingRecord record = getRecordById(id);
        fileHandler.deleteRecord(record.getId());
    }
}