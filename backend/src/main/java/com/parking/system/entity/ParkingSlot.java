package com.parking.system.entity;

/**
 * Represents a parking slot in the lot.
 */
public class ParkingSlot {

    private String slotNumber; // e.g. A01
    private String type; // "Car", "Bike", "Van"
    private String status; // "AVAILABLE", "OCCUPIED"

    /**
     * Default constructor.
     */
    public ParkingSlot() {
    }

    /**
     * Gets the slot number.
     * @return the slot number.
     */
    public String getSlotNumber() {
        return slotNumber;
    }

    /**
     * Sets the slot number.
     * @param slotNumber the slot number to set.
     */
    public void setSlotNumber(String slotNumber) {
        this.slotNumber = slotNumber;
    }

    /**
     * Gets the slot type.
     * @return the slot type.
     */
    public String getType() {
        return type;
    }

    /**
     * Sets the slot type.
     * @param type the slot type to set.
     */
    public void setType(String type) {
        this.type = type;
    }

    /**
     * Gets the slot status.
     * @return the slot status.
     */
    public String getStatus() {
        return status;
    }

    /**
     * Sets the slot status.
     * @param status the slot status to set.
     */
    public void setStatus(String status) {
        this.status = status;
    }
}
