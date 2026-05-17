package com.parking.system.entity;

public class Car extends Vehicle {
    public Car() {
        setType("Car");
    }

    @Override
    public String toString() {
        return super.getPlateNumber() + " (Car - 4 Wheels)";
    }
}
