package com.parking.system.entity;

import java.time.LocalDateTime;


public class ParkingRecord {

    private Long id;
    private Vehicle vehicle;
    private ParkingSlot slot;
    private LocalDateTime entryTime;
    private LocalDateTime exitTime;
    private Double fee;


    public ParkingRecord() {
    }


    public Long getId() {
        return id;
    }


    public void setId(Long id) {
        this.id = id;
    }


    public Vehicle getVehicle() {
        return vehicle;
    }


    public void setVehicle(Vehicle vehicle) {
        this.vehicle = vehicle;
    }


    public ParkingSlot getSlot() {
        return slot;
    }


    public void setSlot(ParkingSlot slot) {
        this.slot = slot;
    }


    public LocalDateTime getEntryTime() {
        return entryTime;
    }


    public void setEntryTime(LocalDateTime entryTime) {
        this.entryTime = entryTime;
    }


    public LocalDateTime getExitTime() {
        return exitTime;
    }


    public void setExitTime(LocalDateTime exitTime) {
        this.exitTime = exitTime;
    }


    public Double getFee() {
        return fee;
    }


    public void setFee(Double fee) {
        this.fee = fee;
    }
}
