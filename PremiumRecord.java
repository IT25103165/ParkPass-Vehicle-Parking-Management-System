package com.parking.system.entity;

public class PremiumRecord extends ParkingRecord {
    private double discount;

    public double getDiscount() {
        return discount;
    }

    public void setDiscount(double discount) {
        this.discount = discount;
    }
}
