package com.smartparking.controller;

import com.smartparking.entity.ParkingSlot;
import com.smartparking.repository.ParkingSlotRepository;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/parking-slots")
public class ParkingController {

    private final ParkingSlotRepository parkingSlotRepository;

    public ParkingController(
            ParkingSlotRepository parkingSlotRepository) {

        this.parkingSlotRepository = parkingSlotRepository;
    }

    // ============================================================
    // GET ALL PARKING SLOTS
    // ============================================================

    @GetMapping
    public ResponseEntity<?> getAllParkingSlots() {

        try {

            List<ParkingSlot> slots =
                    parkingSlotRepository.findAll();

            return ResponseEntity.ok(slots);

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(
                            "PARKING SLOT DATABASE ERROR: "
                                    + e.getClass().getName()
                                    + " | "
                                    + e.getMessage()
                    );
        }
    }

    // ============================================================
    // GET PARKING SLOT BY ID
    // ============================================================

    @GetMapping("/{id}")
    public ResponseEntity<?> getParkingSlotById(
            @PathVariable Integer id) {

        try {

            ParkingSlot slot =
                    parkingSlotRepository
                            .findById(id)
                            .orElse(null);

            if (slot == null) {

                return ResponseEntity
                        .status(HttpStatus.NOT_FOUND)
                        .body(
                                "Parking slot not found with ID: "
                                        + id
                        );
            }

            return ResponseEntity.ok(slot);

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(
                            "PARKING SLOT DATABASE ERROR: "
                                    + e.getClass().getName()
                                    + " | "
                                    + e.getMessage()
                    );
        }
    }

    // ============================================================
    // GET AVAILABLE SLOTS
    // ============================================================

    @GetMapping("/available")
    public ResponseEntity<?> getAvailableSlots() {

        try {

            List<ParkingSlot> slots =
                    parkingSlotRepository
                            .findByStatusIgnoreCase("AVAILABLE");

            return ResponseEntity.ok(slots);

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(
                            "AVAILABLE SLOTS ERROR: "
                                    + e.getClass().getName()
                                    + " | "
                                    + e.getMessage()
                    );
        }
    }

    // ============================================================
    // GET OCCUPIED SLOTS
    // ============================================================

    @GetMapping("/occupied")
    public ResponseEntity<?> getOccupiedSlots() {

        try {

            List<ParkingSlot> slots =
                    parkingSlotRepository
                            .findByStatusIgnoreCase("OCCUPIED");

            return ResponseEntity.ok(slots);

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(
                            "OCCUPIED SLOTS ERROR: "
                                    + e.getClass().getName()
                                    + " | "
                                    + e.getMessage()
                    );
        }
    }

    // ============================================================
    // CREATE PARKING SLOT
    // ============================================================

    @PostMapping
    public ResponseEntity<?> createParkingSlot(
            @RequestBody ParkingSlot slot) {

        try {

            if (slot.getSlotNumber() == null ||
                    slot.getSlotNumber().trim().isEmpty()) {

                return ResponseEntity
                        .badRequest()
                        .body("slotNumber is required");
            }

            if (slot.getSlotSize() == null ||
                    slot.getSlotSize().trim().isEmpty()) {

                return ResponseEntity
                        .badRequest()
                        .body("slotSize is required");
            }

            if (slot.getPricePerHour() == null ||
                    slot.getPricePerHour() < 0) {

                return ResponseEntity
                        .badRequest()
                        .body(
                                "pricePerHour must be greater than or equal to 0"
                        );
            }

            if (slot.getStatus() == null ||
                    slot.getStatus().trim().isEmpty()) {

                slot.setStatus("AVAILABLE");

            } else {

                slot.setStatus(
                        slot.getStatus().toUpperCase()
                );
            }

            ParkingSlot savedSlot =
                    parkingSlotRepository.save(slot);

            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(savedSlot);

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(
                            "PARKING SLOT SAVE ERROR: "
                                    + e.getClass().getName()
                                    + " | "
                                    + e.getMessage()
                    );
        }
    }

    // ============================================================
    // UPDATE PARKING SLOT
    // ============================================================

    @PutMapping("/{id}")
    public ResponseEntity<?> updateParkingSlot(
            @PathVariable Integer id,
            @RequestBody ParkingSlot updatedSlot) {

        try {

            ParkingSlot existingSlot =
                    parkingSlotRepository
                            .findById(id)
                            .orElse(null);

            if (existingSlot == null) {

                return ResponseEntity
                        .status(HttpStatus.NOT_FOUND)
                        .body(
                                "Parking slot not found with ID: "
                                        + id
                        );
            }

            if (updatedSlot.getSlotNumber() != null &&
                    !updatedSlot.getSlotNumber()
                            .trim()
                            .isEmpty()) {

                existingSlot.setSlotNumber(
                        updatedSlot.getSlotNumber()
                );
            }

            if (updatedSlot.getFloor() != null) {

                existingSlot.setFloor(
                        updatedSlot.getFloor()
                );
            }

            if (updatedSlot.getSection() != null) {

                existingSlot.setSection(
                        updatedSlot.getSection()
                );
            }

            if (updatedSlot.getSlotSize() != null &&
                    !updatedSlot.getSlotSize()
                            .trim()
                            .isEmpty()) {

                existingSlot.setSlotSize(
                        updatedSlot.getSlotSize()
                );
            }

            if (updatedSlot.getVehicleType() != null) {

                existingSlot.setVehicleType(
                        updatedSlot.getVehicleType()
                );
            }

            if (updatedSlot.getPricePerHour() != null) {

                if (updatedSlot.getPricePerHour() < 0) {

                    return ResponseEntity
                            .badRequest()
                            .body(
                                    "pricePerHour cannot be negative"
                            );
                }

                existingSlot.setPricePerHour(
                        updatedSlot.getPricePerHour()
                );
            }

            if (updatedSlot.getStatus() != null &&
                    !updatedSlot.getStatus()
                            .trim()
                            .isEmpty()) {

                String status =
                        updatedSlot.getStatus()
                                .trim()
                                .toUpperCase();

                if (!status.equals("AVAILABLE") &&
                        !status.equals("OCCUPIED")) {

                    return ResponseEntity
                            .badRequest()
                            .body(
                                    "Status must be AVAILABLE or OCCUPIED"
                            );
                }

                existingSlot.setStatus(status);
            }

            ParkingSlot savedSlot =
                    parkingSlotRepository.save(existingSlot);

            return ResponseEntity.ok(savedSlot);

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(
                            "PARKING SLOT UPDATE ERROR: "
                                    + e.getClass().getName()
                                    + " | "
                                    + e.getMessage()
                    );
        }
    }

    // ============================================================
    // CHANGE SLOT STATUS
    // ============================================================

    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateSlotStatus(
            @PathVariable Integer id,
            @RequestParam String status) {

        try {

            ParkingSlot slot =
                    parkingSlotRepository
                            .findById(id)
                            .orElse(null);

            if (slot == null) {

                return ResponseEntity
                        .status(HttpStatus.NOT_FOUND)
                        .body(
                                "Parking slot not found with ID: "
                                        + id
                        );
            }

            if (status == null ||
                    (!status.equalsIgnoreCase("AVAILABLE") &&
                     !status.equalsIgnoreCase("OCCUPIED"))) {

                return ResponseEntity
                        .badRequest()
                        .body(
                                "Status must be AVAILABLE or OCCUPIED"
                        );
            }

            slot.setStatus(
                    status.toUpperCase()
            );

            ParkingSlot savedSlot =
                    parkingSlotRepository.save(slot);

            return ResponseEntity.ok(savedSlot);

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(
                            "PARKING SLOT STATUS ERROR: "
                                    + e.getClass().getName()
                                    + " | "
                                    + e.getMessage()
                    );
        }
    }

    // ============================================================
    // DELETE PARKING SLOT
    // ============================================================

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteParkingSlot(
            @PathVariable Integer id) {

        try {

            if (!parkingSlotRepository.existsById(id)) {

                return ResponseEntity
                        .status(HttpStatus.NOT_FOUND)
                        .body(
                                "Parking slot not found with ID: "
                                        + id
                        );
            }

            parkingSlotRepository.deleteById(id);

            return ResponseEntity.ok(
                    "Parking slot deleted successfully"
            );

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(
                            "PARKING SLOT DELETE ERROR: "
                                    + e.getClass().getName()
                                    + " | "
                                    + e.getMessage()
                    );
        }
    }
}