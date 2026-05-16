package com.parking.system.util;

import com.parking.system.entity.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import jakarta.annotation.PostConstruct;
import java.io.IOException;
import java.nio.file.*;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Utility class to handle all text-file operations (CRUD) for the system.
 */
@Component
public class FileHandler {

    @Value("${storage.path:data/}")
    private String storagePath;

    @PostConstruct
    public void init() {
        try {
            Files.createDirectories(Paths.get(storagePath));
        } catch (IOException e) {
            throw new RuntimeException("Could not initialize storage directory", e);
        }
    }

    // =========================================================
    // GENERIC FILE OPERATIONS
    // =========================================================

    private List<String> readLines(String fileName) {

        Path path = Paths.get(storagePath, fileName);

        if (!Files.exists(path)) {
            return new ArrayList<>();
        }

        try {
            return Files.readAllLines(path);
        } catch (IOException e) {
            return new ArrayList<>();
        }
    }

    private void writeLines(String fileName, List<String> lines) {

        try {
            Files.write(Paths.get(storagePath, fileName), lines);
        } catch (IOException e) {
            throw new RuntimeException("Could not write to file: " + fileName, e);
        }
    }

    // =========================================================
    // USER MANAGEMENT
    // =========================================================

    public List<User> getAllUsers() {

        List<String> lines = readLines("users.txt");

        if (lines.isEmpty()) {
            return new ArrayList<>();
        }

        return lines.stream()

                .filter(line -> line != null && !line.isBlank())

                .map(line -> line.split(","))

                .filter(parts -> parts.length >= 5)

                .map(parts -> {

                    String role = parts[4].trim();

                    User u;

                    if ("ADMIN".equalsIgnoreCase(role)) {
                        u = new Admin();
                    } else {
                        u = new Customer();
                    }

                    u.setId(Long.parseLong(parts[0].trim()));
                    u.setName(parts[1].trim());
                    u.setEmail(parts[2].trim());
                    u.setPassword(parts[3].trim());
                    u.setRole(role);

                    return u;
                })

                .collect(Collectors.toList());
    }

    public void saveUser(User user) {

        List<User> users = getAllUsers();

        if (user.getId() == null) {

            long maxId = users.stream()
                    .mapToLong(User::getId)
                    .max()
                    .orElse(0);

            user.setId(maxId + 1);

            users.add(user);

        } else {

            users.removeIf(u -> u.getId().equals(user.getId()));

            users.add(user);
        }

        writeLines(
                "users.txt",
                users.stream()
                        .map(u -> String.join(",",
                                u.getId().toString(),
                                u.getName(),
                                u.getEmail(),
                                u.getPassword(),
                                u.getRole()
                        ))
                        .collect(Collectors.toList())
        );
    }

    public void deleteUser(Long id) {

        List<User> users = getAllUsers();

        users.removeIf(u -> u.getId().equals(id));

        writeLines(
                "users.txt",
                users.stream()
                        .map(u -> String.join(",",
                                u.getId().toString(),
                                u.getName(),
                                u.getEmail(),
                                u.getPassword(),
                                u.getRole()
                        ))
                        .collect(Collectors.toList())
        );
    }

    // =========================================================
    // VEHICLE MANAGEMENT
    // =========================================================

    public List<Vehicle> getAllVehicles() {

        List<User> users = getAllUsers();

        return readLines("vehicles.txt").stream()

                .filter(line -> line != null && !line.isBlank())

                .map(line -> line.split(","))

                .filter(parts -> parts.length >= 5)

                .map(parts -> {

                    String type = parts[2];

                    Vehicle v;

                    if (type.equalsIgnoreCase("Bike")) {
                        v = new Bike();
                    } else if (type.equalsIgnoreCase("Van")) {
                        v = new Van();
                    } else {
                        v = new Car();
                    }

                    v.setId(Long.parseLong(parts[0]));
                    v.setPlateNumber(parts[1]);
                    v.setType(type);
                    v.setBrand(parts[3]);

                    Long ownerId = Long.parseLong(parts[4]);

                    v.setOwner(
                            users.stream()
                                    .filter(u -> u.getId().equals(ownerId))
                                    .findFirst()
                                    .orElse(null)
                    );

                    return v;
                })

                .collect(Collectors.toList());
    }

    public void saveVehicle(Vehicle vehicle) {

        List<Vehicle> vehicles = getAllVehicles();

        if (vehicle.getId() == null) {

            long maxId = vehicles.stream()
                    .mapToLong(Vehicle::getId)
                    .max()
                    .orElse(0);

            vehicle.setId(maxId + 1);

            vehicles.add(vehicle);

        } else {

            vehicles.removeIf(v -> v.getId().equals(vehicle.getId()));

            vehicles.add(vehicle);
        }

        writeLines(
                "vehicles.txt",
                vehicles.stream()
                        .map(v -> String.join(",",
                                v.getId().toString(),
                                v.getPlateNumber(),
                                v.getType(),
                                v.getBrand(),
                                v.getOwner().getId().toString()
                        ))
                        .collect(Collectors.toList())
        );
    }

    public void deleteVehicle(Long id) {

        List<Vehicle> vehicles = getAllVehicles();

        vehicles.removeIf(v -> v.getId().equals(id));

        writeLines(
                "vehicles.txt",
                vehicles.stream()
                        .map(v -> String.join(",",
                                v.getId().toString(),
                                v.getPlateNumber(),
                                v.getType(),
                                v.getBrand(),
                                v.getOwner().getId().toString()
                        ))
                        .collect(Collectors.toList())
        );
    }

    // =========================================================
    // PARKING SLOT MANAGEMENT
    // =========================================================

    public List<ParkingSlot> getAllSlots() {

        return readLines("parking_slots.txt").stream()

                .filter(line -> line != null && !line.isBlank())

                .map(line -> line.split(","))

                .filter(parts -> parts.length >= 3)

                .map(parts -> {

                    String type = parts[1];

                    ParkingSlot s;

                    if (type.equalsIgnoreCase("Bike")) {
                        s = new BikeSlot();
                    } else {
                        s = new CarSlot();
                    }

                    s.setSlotNumber(parts[0]);
                    s.setType(type);
                    s.setStatus(parts[2]);

                    return s;
                })

                .collect(Collectors.toList());
    }

    public void saveSlot(ParkingSlot slot) {

        List<ParkingSlot> slots = getAllSlots();

        slots.removeIf(s -> s.getSlotNumber().equals(slot.getSlotNumber()));

        slots.add(slot);

        writeLines(
                "parking_slots.txt",
                slots.stream()
                        .map(s -> String.join(",",
                                s.getSlotNumber(),
                                s.getType(),
                                s.getStatus()
                        ))
                        .collect(Collectors.toList())
        );
    }

    public void deleteSlot(String slotNumber) {

        List<ParkingSlot> slots = getAllSlots();

        slots.removeIf(s -> s.getSlotNumber().equals(slotNumber));

        writeLines(
                "parking_slots.txt",
                slots.stream()
                        .map(s -> String.join(",",
                                s.getSlotNumber(),
                                s.getType(),
                                s.getStatus()
                        ))
                        .collect(Collectors.toList())
        );
    }

    // =========================================================
    // PARKING RECORD MANAGEMENT
    // =========================================================

    public List<ParkingRecord> getAllRecords() {

        List<Vehicle> vehicles = getAllVehicles();
        List<ParkingSlot> slots = getAllSlots();

        return readLines("parking_records.txt").stream()

                .filter(line -> line != null && !line.isBlank())

                .map(line -> line.split(","))

                .filter(parts -> parts.length >= 6)

                .map(parts -> {

                    ParkingRecord r = new ParkingRecord();

                    r.setId(Long.parseLong(parts[0]));

                    Long vId = Long.parseLong(parts[1]);

                    r.setVehicle(
                            vehicles.stream()
                                    .filter(v -> v.getId().equals(vId))
                                    .findFirst()
                                    .orElse(null)
                    );

                    String sNum = parts[2];

                    r.setSlot(
                            slots.stream()
                                    .filter(s -> s.getSlotNumber().equals(sNum))
                                    .findFirst()
                                    .orElse(null)
                    );

                    r.setEntryTime(LocalDateTime.parse(parts[3]));

                    if (!parts[4].equals("null")) {
                        r.setExitTime(LocalDateTime.parse(parts[4]));
                    }

                    if (!parts[5].equals("null")) {
                        r.setFee(Double.parseDouble(parts[5]));
                    }

                    return r;
                })

                .collect(Collectors.toList());
    }

    public void saveRecord(ParkingRecord record) {

        List<ParkingRecord> records = getAllRecords();

        if (record.getId() == null) {

            long maxId = records.stream()
                    .mapToLong(ParkingRecord::getId)
                    .max()
                    .orElse(0);

            record.setId(maxId + 1);

            records.add(record);

        } else {

            records.removeIf(r -> r.getId().equals(record.getId()));

            records.add(record);
        }

        writeLines(
                "parking_records.txt",
                records.stream()
                        .map(r -> String.join(",",
                                r.getId().toString(),
                                r.getVehicle().getId().toString(),
                                r.getSlot().getSlotNumber(),
                                r.getEntryTime().toString(),
                                r.getExitTime() != null ? r.getExitTime().toString() : "null",
                                r.getFee() != null ? r.getFee().toString() : "null"
                        ))
                        .collect(Collectors.toList())
        );
    }

    public void deleteRecord(Long id) {

        List<ParkingRecord> records = getAllRecords();

        records.removeIf(r -> r.getId().equals(id));

        writeLines(
                "parking_records.txt",
                records.stream()
                        .map(r -> String.join(",",
                                r.getId().toString(),
                                r.getVehicle().getId().toString(),
                                r.getSlot().getSlotNumber(),
                                r.getEntryTime().toString(),
                                r.getExitTime() != null ? r.getExitTime().toString() : "null",
                                r.getFee() != null ? r.getFee().toString() : "null"
                        ))
                        .collect(Collectors.toList())
        );
    }

    // =========================================================
    // FEEDBACK MANAGEMENT
    // =========================================================

    public List<Feedback> getAllFeedback() {

        List<User> users = getAllUsers();

        return readLines("feedback.txt").stream()

                .filter(line -> line != null && !line.isBlank())

                .map(line -> line.split(","))

                .filter(parts -> parts.length >= 5)

                .map(parts -> {

                    Feedback f = new VerifiedFeedback();

                    f.setId(Long.parseLong(parts[0]));

                    Long userId = Long.parseLong(parts[1]);

                    f.setUser(
                            users.stream()
                                    .filter(u -> u.getId().equals(userId))
                                    .findFirst()
                                    .orElse(null)
                    );

                    f.setMessage(parts[2].replace("||", ","));

                    f.setRating(Integer.parseInt(parts[3]));

                    f.setDate(LocalDateTime.parse(parts[4]));

                    return f;
                })

                .collect(Collectors.toList());
    }

    public void saveFeedback(Feedback feedback) {

        List<Feedback> feedbackList = getAllFeedback();

        if (feedback.getId() == null) {

            long maxId = feedbackList.stream()
                    .mapToLong(Feedback::getId)
                    .max()
                    .orElse(0);

            feedback.setId(maxId + 1);

            feedbackList.add(feedback);

        } else {

            feedbackList.removeIf(f -> f.getId().equals(feedback.getId()));

            feedbackList.add(feedback);
        }

        writeLines(
                "feedback.txt",
                feedbackList.stream()
                        .map(f -> String.join(",",
                                f.getId().toString(),
                                f.getUser().getId().toString(),
                                f.getMessage().replace(",", "||"),
                                String.valueOf(f.getRating()),
                                f.getDate().toString()
                        ))
                        .collect(Collectors.toList())
        );
    }

    public void deleteFeedback(Long id) {

        List<Feedback> feedbackList = getAllFeedback();

        feedbackList.removeIf(f -> f.getId().equals(id));

        writeLines(
                "feedback.txt",
                feedbackList.stream()
                        .map(f -> String.join(",",
                                f.getId().toString(),
                                f.getUser().getId().toString(),
                                f.getMessage().replace(",", "||"),
                                String.valueOf(f.getRating()),
                                f.getDate().toString()
                        ))
                        .collect(Collectors.toList())
        );
    }
}