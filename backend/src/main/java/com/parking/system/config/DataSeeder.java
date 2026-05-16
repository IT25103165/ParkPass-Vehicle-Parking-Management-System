package com.parking.system.config;

import com.parking.system.entity.*;
import com.parking.system.util.FileHandler;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
public class DataSeeder implements CommandLineRunner {

    @Autowired
    private FileHandler fileHandler;

    @Override
    public void run(String... args) {
        if (fileHandler.getAllUsers().isEmpty()) {
            System.out.println("Seeding default data to text files...");

            User admin = new Admin();
            admin.setName("Admin User");
            admin.setEmail("admin@parking.com");
            admin.setPassword("admin123");
            admin.setRole("ADMIN");
            fileHandler.saveUser(admin);

            User customer1 = new Customer();
            customer1.setName("John Doe");
            customer1.setEmail("john@example.com");
            customer1.setPassword("pass123");
            customer1.setRole("CUSTOMER");
            fileHandler.saveUser(customer1);

            User customer2 = new Customer();
            customer2.setName("Jane Smith");
            customer2.setEmail("jane@example.com");
            customer2.setPassword("pass123");
            customer2.setRole("CUSTOMER");
            fileHandler.saveUser(customer2);

            // Reload users after saving, so they have IDs
            customer1 = fileHandler.getAllUsers().stream()
                    .filter(u -> u.getEmail().equalsIgnoreCase("john@example.com"))
                    .findFirst()
                    .orElseThrow();

            customer2 = fileHandler.getAllUsers().stream()
                    .filter(u -> u.getEmail().equalsIgnoreCase("jane@example.com"))
                    .findFirst()
                    .orElseThrow();

            Vehicle v1 = new Car();
            v1.setPlateNumber("ABC-1234");
            v1.setType("Car");
            v1.setBrand("Toyota");
            v1.setOwner(customer1);
            fileHandler.saveVehicle(v1);

            Vehicle v2 = new Bike();
            v2.setPlateNumber("XYZ-9876");
            v2.setType("Bike");
            v2.setBrand("Yamaha");
            v2.setOwner(customer1);
            fileHandler.saveVehicle(v2);

            Vehicle v3 = new Van();
            v3.setPlateNumber("VAN-5555");
            v3.setType("Van");
            v3.setBrand("Nissan");
            v3.setOwner(customer2);
            fileHandler.saveVehicle(v3);

            String[] carSlots = {"A01", "A02", "A03"};
            for (String s : carSlots) {
                ParkingSlot slot = new CarSlot();
                slot.setSlotNumber(s);
                slot.setType("Car");
                slot.setStatus("AVAILABLE");
                fileHandler.saveSlot(slot);
            }

            String[] bikeSlots = {"B01", "B02"};
            for (String s : bikeSlots) {
                ParkingSlot slot = new BikeSlot();
                slot.setSlotNumber(s);
                slot.setType("Bike");
                slot.setStatus("AVAILABLE");
                fileHandler.saveSlot(slot);
            }

            String[] vanSlots = {"V01", "V02"};
            for (String s : vanSlots) {
                ParkingSlot slot = new CarSlot();
                slot.setSlotNumber(s);
                slot.setType("Van");
                slot.setStatus("AVAILABLE");
                fileHandler.saveSlot(slot);
            }

            ParkingRecord pr = new ParkingRecord();
            pr.setVehicle(v1);
            pr.setSlot(fileHandler.getAllSlots().stream()
                    .filter(s -> s.getSlotNumber().equals("A01"))
                    .findFirst()
                    .orElseThrow());
            pr.setEntryTime(LocalDateTime.now().minusHours(3));
            pr.setExitTime(LocalDateTime.now().minusHours(1));
            pr.setFee(100.0);
            fileHandler.saveRecord(pr);

            ParkingSlot activeSlot = fileHandler.getAllSlots().stream()
                    .filter(s -> s.getSlotNumber().equals("B01"))
                    .findFirst()
                    .orElseThrow();

            activeSlot.setStatus("OCCUPIED");
            fileHandler.saveSlot(activeSlot);

            ParkingRecord activeRecord = new ParkingRecord();
            activeRecord.setVehicle(v2);
            activeRecord.setSlot(activeSlot);
            activeRecord.setEntryTime(LocalDateTime.now().minusMinutes(45));
            activeRecord.setExitTime(null);
            activeRecord.setFee(null);
            fileHandler.saveRecord(activeRecord);

            Feedback f1 = new VerifiedFeedback();
            f1.setUser(customer1);
            f1.setMessage("Great parking facility!");
            f1.setRating(5);
            f1.setDate(LocalDateTime.now().minusDays(1));
            fileHandler.saveFeedback(f1);

            Feedback f2 = new VerifiedFeedback();
            f2.setUser(customer2);
            f2.setMessage("A bit crowded but good.");
            f2.setRating(4);
            f2.setDate(LocalDateTime.now().minusHours(5));
            fileHandler.saveFeedback(f2);

            System.out.println("Default data seeded to text files successfully.");
        }
    }
}