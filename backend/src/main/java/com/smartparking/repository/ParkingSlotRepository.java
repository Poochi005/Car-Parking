package com.smartparking.repository;

import com.smartparking.entity.ParkingSlot;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ParkingSlotRepository extends JpaRepository<ParkingSlot, Integer> {

    List<ParkingSlot> findByStatusIgnoreCase(String status);

}