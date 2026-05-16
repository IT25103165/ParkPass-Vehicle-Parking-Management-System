package com.parking.system.entity;

public class Bike extends Vehicle {
    public Bike() {
        setType("Bike");
    }

    @Override
    public String toString() {
        return super.getPlateNumber() + " (Bike - 2 Wheels)";
    }
}
