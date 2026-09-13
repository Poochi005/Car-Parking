package com.smartparking.repository;

import com.smartparking.entity.Vehicle;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface VehicleRepository extends JpaRepository<Vehicle, Integer> {

    Optional<Vehicle> findByVehicleNumber(String vehicleNumber);

}