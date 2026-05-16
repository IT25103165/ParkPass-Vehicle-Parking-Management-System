package com.parking.system.entity;

/**
 * Represents a vehicle owned by a user.
 */
public class Vehicle {

    private Long id;
    private String plateNumber;
    private String type; // "Car", "Bike", "Van"
    private String brand;
    private User owner;

    /**
     * Default constructor.
     */
    public Vehicle() {
    }

    /**
     * Gets the vehicle ID.
     * @return the vehicle ID.
     */
    public Long getId() {
        return id;
    }

    /**
     * Sets the vehicle ID.
     * @param id the vehicle ID to set.
     */
    public void setId(Long id) {
        this.id = id;
    }

    /**
     * Gets the plate number.
     * @return the plate number.
     */
    public String getPlateNumber() {
        return plateNumber;
    }

    /**
     * Sets the plate number.
     * @param plateNumber the plate number to set.
     */
    public void setPlateNumber(String plateNumber) {
        this.plateNumber = plateNumber;
    }

    /**
     * Gets the vehicle type.
     * @return the vehicle type.
     */
    public String getType() {
        return type;
    }

    /**
     * Sets the vehicle type.
     * @param type the vehicle type to set.
     */
    public void setType(String type) {
        this.type = type;
    }

    /**
     * Gets the vehicle brand.
     * @return the brand.
     */
    public String getBrand() {
        return brand;
    }

    /**
     * Sets the vehicle brand.
     * @param brand the brand to set.
     */
    public void setBrand(String brand) {
        this.brand = brand;
    }

    /**
     * Gets the owner of the vehicle.
     * @return the owner.
     */
    public User getOwner() {
        return owner;
    }

    /**
     * Sets the owner of the vehicle.
     * @param owner the owner to set.
     */
    public void setOwner(User owner) {
        this.owner = owner;
    }
}
