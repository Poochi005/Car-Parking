package com.smartparking.repository;

import com.smartparking.entity.ParkingBooking;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ParkingBookingRepository
        extends JpaRepository<ParkingBooking, Integer> {

    List<ParkingBooking> findByUserId(Integer userId);

    List<ParkingBooking> findByVehicleId(Integer vehicleId);

    List<ParkingBooking> findBySlotId(Integer slotId);

    List<ParkingBooking> findByStatus(String status);

    List<ParkingBooking> findByUserIdAndStatus(
            Integer userId,
            String status
    );
}