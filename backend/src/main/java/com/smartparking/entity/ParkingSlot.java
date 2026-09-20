package com.smartparking.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "parking_slots")
public class ParkingSlot {

    // ============================================================
    // PRIMARY KEY
    // ============================================================

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    // ============================================================
    // SLOT NUMBER
    // ============================================================

    @Column(
        name = "slot_number",
        nullable = false,
        unique = true
    )
    private String slotNumber;

    // ============================================================
    // FLOOR
    // ============================================================

    @Column(name = "floor")
    private String floor;

    // ============================================================
    // SECTION
    // ============================================================

    @Column(name = "section")
    private String section;

    // ============================================================
    // SLOT SIZE
    // ============================================================

    @Column(
        name = "slot_size",
        nullable = false
    )
    private String slotSize;

    // ============================================================
    // VEHICLE TYPE
    // ============================================================

    @Column(name = "vehicle_type")
    private String vehicleType;

    // ============================================================
    // PRICE PER HOUR
    // ============================================================

    @Column(name = "price_per_hour")
    private Double pricePerHour;

    // ============================================================
    // STATUS
    // ============================================================

    @Column(name = "status")
    private String status;

    // ============================================================
    // GPS LOCATION
    // ============================================================

    @Column(name = "latitude")
    private Double latitude;

    @Column(name = "longitude")
    private Double longitude;

    // ============================================================
    // DEFAULT CONSTRUCTOR
    // ============================================================

    public ParkingSlot() {
    }

    // ============================================================
    // GET ID
    // ============================================================

    public Integer getId() {
        return id;
    }

    // ============================================================
    // SET ID
    // ============================================================

    public void setId(Integer id) {
        this.id = id;
    }

    // ============================================================
    // GET SLOT NUMBER
    // ============================================================

    public String getSlotNumber() {
        return slotNumber;
    }

    // ============================================================
    // SET SLOT NUMBER
    // ============================================================

    public void setSlotNumber(String slotNumber) {
        this.slotNumber = slotNumber;
    }

    // ============================================================
    // GET FLOOR
    // ============================================================

    public String getFloor() {
        return floor;
    }

    // ============================================================
    // SET FLOOR
    // ============================================================

    public void setFloor(String floor) {
        this.floor = floor;
    }

    // ============================================================
    // GET SECTION
    // ============================================================

    public String getSection() {
        return section;
    }

    // ============================================================
    // SET SECTION
    // ============================================================

    public void setSection(String section) {
        this.section = section;
    }

    // ============================================================
    // GET SLOT SIZE
    // ============================================================

    public String getSlotSize() {
        return slotSize;
    }

    // ============================================================
    // SET SLOT SIZE
    // ============================================================

    public void setSlotSize(String slotSize) {
        this.slotSize = slotSize;
    }

    // ============================================================
    // GET VEHICLE TYPE
    // ============================================================

    public String getVehicleType() {
        return vehicleType;
    }

    // ============================================================
    // SET VEHICLE TYPE
    // ============================================================

    public void setVehicleType(String vehicleType) {
        this.vehicleType = vehicleType;
    }

    // ============================================================
    // GET PRICE PER HOUR
    // ============================================================

    public Double getPricePerHour() {
        return pricePerHour;
    }

    // ============================================================
    // SET PRICE PER HOUR
    // ============================================================

    public void setPricePerHour(Double pricePerHour) {
        this.pricePerHour = pricePerHour;
    }

    // ============================================================
    // GET STATUS
    // ============================================================

    public String getStatus() {
        return status;
    }

    // ============================================================
    // SET STATUS
    // ============================================================

    public void setStatus(String status) {
        this.status = status;
    }

    // ============================================================
    // GET LATITUDE
    // ============================================================

    public Double getLatitude() {
        return latitude;
    }

    // ============================================================
    // SET LATITUDE
    // ============================================================

    public void setLatitude(Double latitude) {
        this.latitude = latitude;
    }

    // ============================================================
    // GET LONGITUDE
    // ============================================================

    public Double getLongitude() {
        return longitude;
    }

    // ============================================================
    // SET LONGITUDE
    // ============================================================

    public void setLongitude(Double longitude) {
        this.longitude = longitude;
    }
}