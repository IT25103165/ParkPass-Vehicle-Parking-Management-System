package com.parking.system.entity;

import java.time.LocalDateTime;

/**
 * Represents a parking record showing entry/exit times and fee.
 */
public class ParkingRecord {

    private Long id;
    private Vehicle vehicle;
    private ParkingSlot slot;
    private LocalDateTime entryTime;
    private LocalDateTime exitTime;
    private Double fee;

    /**
     * Default constructor.
     */
    public ParkingRecord() {
    }

    /**
     * Gets the record ID.
     * @return the record ID.
     */
    public Long getId() {
        return id;
    }

    /**
     * Sets the record ID.
     * @param id the record ID to set.
     */
    public void setId(Long id) {
        this.id = id;
    }

    /**
     * Gets the parked vehicle.
     * @return the vehicle.
     */
    public Vehicle getVehicle() {
        return vehicle;
    }

    /**
     * Sets the parked vehicle.
     * @param vehicle the vehicle to set.
     */
    public void setVehicle(Vehicle vehicle) {
        this.vehicle = vehicle;
    }

    /**
     * Gets the parking slot.
     * @return the parking slot.
     */
    public ParkingSlot getSlot() {
        return slot;
    }

    /**
     * Sets the parking slot.
     * @param slot the parking slot to set.
     */
    public void setSlot(ParkingSlot slot) {
        this.slot = slot;
    }

    /**
     * Gets the entry time.
     * @return the entry time.
     */
    public LocalDateTime getEntryTime() {
        return entryTime;
    }

    /**
     * Sets the entry time.
     * @param entryTime the entry time to set.
     */
    public void setEntryTime(LocalDateTime entryTime) {
        this.entryTime = entryTime;
    }

    /**
     * Gets the exit time.
     * @return the exit time.
     */
    public LocalDateTime getExitTime() {
        return exitTime;
    }

    /**
     * Sets the exit time.
     * @param exitTime the exit time to set.
     */
    public void setExitTime(LocalDateTime exitTime) {
        this.exitTime = exitTime;
    }

    /**
     * Gets the parking fee.
     * @return the fee.
     */
    public Double getFee() {
        return fee;
    }

    /**
     * Sets the parking fee.
     * @param fee the fee to set.
     */
    public void setFee(Double fee) {
        this.fee = fee;
    }
}
