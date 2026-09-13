package com.smartparking.controller;

import com.smartparking.entity.Vehicle;
import com.smartparking.repository.VehicleRepository;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/vehicles")
@CrossOrigin(origins = {
        "http://localhost:5500",
        "http://127.0.0.1:5500"
})
public class VehicleController {

    private final VehicleRepository vehicleRepository;

    public VehicleController(VehicleRepository vehicleRepository) {
        this.vehicleRepository = vehicleRepository;
    }


    // =========================================================
    // GET ALL VEHICLES
    // =========================================================

    @GetMapping
    public ResponseEntity<List<Vehicle>> getAllVehicles() {

        return ResponseEntity.ok(
                vehicleRepository.findAll()
        );
    }


    // =========================================================
    // GET VEHICLE BY ID
    // =========================================================

    @GetMapping("/{id}")
    public ResponseEntity<?> getVehicleById(
            @PathVariable Integer id) {

        Vehicle vehicle =
                vehicleRepository.findById(id).orElse(null);

        if (vehicle == null) {

            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body("Vehicle not found");

        }

        return ResponseEntity.ok(vehicle);
    }


    // =========================================================
    // ADD VEHICLE
    // =========================================================

    @PostMapping
    public ResponseEntity<?> addVehicle(
            @RequestBody Map<String, Object> data) {

        try {

            // -------------------------------------------------
            // CHECK REQUIRED FIELDS
            // -------------------------------------------------

            if (data.get("userId") == null) {
                return ResponseEntity.badRequest()
                        .body("User ID is required");
            }

            if (data.get("vehicleNumber") == null ||
                    data.get("vehicleNumber").toString().trim().isEmpty()) {

                return ResponseEntity.badRequest()
                        .body("Vehicle number is required");
            }

            if (data.get("vehicleModel") == null ||
                    data.get("vehicleModel").toString().trim().isEmpty()) {

                return ResponseEntity.badRequest()
                        .body("Vehicle model is required");
            }

            if (data.get("vehicleColor") == null ||
                    data.get("vehicleColor").toString().trim().isEmpty()) {

                return ResponseEntity.badRequest()
                        .body("Vehicle color is required");
            }

            if (data.get("vehicleSize") == null ||
                    data.get("vehicleSize").toString().trim().isEmpty()) {

                return ResponseEntity.badRequest()
                        .body("Vehicle size is required");
            }

            if (data.get("vehicleType") == null ||
                    data.get("vehicleType").toString().trim().isEmpty()) {

                return ResponseEntity.badRequest()
                        .body("Vehicle type is required");
            }


            // -------------------------------------------------
            // GET VALUES
            // -------------------------------------------------

            Integer userId =
                    Integer.valueOf(
                            data.get("userId").toString()
                    );

            String vehicleNumber =
                    data.get("vehicleNumber")
                            .toString()
                            .trim()
                            .toUpperCase();

            String vehicleModel =
                    data.get("vehicleModel")
                            .toString()
                            .trim();

            String vehicleColor =
                    data.get("vehicleColor")
                            .toString()
                            .trim();

            String vehicleSize =
                    data.get("vehicleSize")
                            .toString()
                            .trim();

            String vehicleType =
                    data.get("vehicleType")
                            .toString()
                            .trim();


            // -------------------------------------------------
            // CHECK DUPLICATE VEHICLE NUMBER
            // -------------------------------------------------

            List<Vehicle> allVehicles =
                    vehicleRepository.findAll();

            for (Vehicle existingVehicle : allVehicles) {

                if (existingVehicle.getVehicleNumber() != null &&
                        existingVehicle.getVehicleNumber()
                                .equalsIgnoreCase(vehicleNumber)) {

                    return ResponseEntity
                            .status(HttpStatus.CONFLICT)
                            .body(
                                    "Vehicle number "
                                    + vehicleNumber
                                    + " is already registered."
                            );
                }
            }


            // -------------------------------------------------
            // CREATE VEHICLE
            // -------------------------------------------------

            Vehicle vehicle = new Vehicle();

            vehicle.setUserId(userId);
            vehicle.setVehicleNumber(vehicleNumber);
            vehicle.setVehicleModel(vehicleModel);
            vehicle.setVehicleColor(vehicleColor);
            vehicle.setVehicleSize(vehicleSize);
            vehicle.setVehicleType(vehicleType);


            // -------------------------------------------------
            // SAVE
            // -------------------------------------------------

            Vehicle savedVehicle =
                    vehicleRepository.save(vehicle);


            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(savedVehicle);


        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(
                            "Vehicle could not be added: "
                            + e.getMessage()
                    );
        }
    }


    // =========================================================
    // UPDATE VEHICLE
    // =========================================================

    @PutMapping("/{id}")
    public ResponseEntity<?> updateVehicle(
            @PathVariable Integer id,
            @RequestBody Map<String, Object> data) {

        try {

            Vehicle vehicle =
                    vehicleRepository.findById(id)
                            .orElse(null);

            if (vehicle == null) {

                return ResponseEntity
                        .status(HttpStatus.NOT_FOUND)
                        .body("Vehicle not found");
            }


            if (data.get("userId") != null) {
                vehicle.setUserId(
                        Integer.valueOf(
                                data.get("userId").toString()
                        )
                );
            }

            if (data.get("vehicleNumber") != null) {
                vehicle.setVehicleNumber(
                        data.get("vehicleNumber")
                                .toString()
                                .trim()
                                .toUpperCase()
                );
            }

            if (data.get("vehicleModel") != null) {
                vehicle.setVehicleModel(
                        data.get("vehicleModel")
                                .toString()
                                .trim()
                );
            }

            if (data.get("vehicleColor") != null) {
                vehicle.setVehicleColor(
                        data.get("vehicleColor")
                                .toString()
                                .trim()
                );
            }

            if (data.get("vehicleSize") != null) {
                vehicle.setVehicleSize(
                        data.get("vehicleSize")
                                .toString()
                                .trim()
                );
            }

            if (data.get("vehicleType") != null) {
                vehicle.setVehicleType(
                        data.get("vehicleType")
                                .toString()
                                .trim()
                );
            }


            Vehicle updatedVehicle =
                    vehicleRepository.save(vehicle);


            return ResponseEntity.ok(updatedVehicle);


        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(
                            "Vehicle update failed: "
                            + e.getMessage()
                    );
        }
    }


    // =========================================================
    // DELETE VEHICLE
    // =========================================================

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteVehicle(
            @PathVariable Integer id) {

        try {

            if (!vehicleRepository.existsById(id)) {

                return ResponseEntity
                        .status(HttpStatus.NOT_FOUND)
                        .body(
                                "Vehicle with ID "
                                + id
                                + " not found"
                        );
            }


            vehicleRepository.deleteById(id);


            return ResponseEntity.ok(
                    "Vehicle with ID "
                    + id
                    + " deleted successfully"
            );


        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(
                            "Vehicle delete failed: "
                            + e.getMessage()
                    );
        }
    }
}