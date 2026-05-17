package com.parking.system.entity;

public class Van extends Vehicle {
    public Van() {
        setType("Van");
    }

    @Override
    public String toString() {
        return super.getPlateNumber() + " (Van - Large Vehicle)";
    }
}
