package com.smartparking.controller;

import com.smartparking.entity.ParkingBooking;
import com.smartparking.entity.ParkingSlot;
import com.smartparking.entity.Vehicle;
import com.smartparking.repository.ParkingBookingRepository;
import com.smartparking.repository.ParkingSlotRepository;
import com.smartparking.repository.VehicleRepository;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/parking-bookings")
public class ParkingBookingController {

    private final ParkingBookingRepository parkingBookingRepository;
    private final ParkingSlotRepository parkingSlotRepository;
    private final VehicleRepository vehicleRepository;

    public ParkingBookingController(
            ParkingBookingRepository parkingBookingRepository,
            ParkingSlotRepository parkingSlotRepository,
            VehicleRepository vehicleRepository) {

        this.parkingBookingRepository = parkingBookingRepository;
        this.parkingSlotRepository = parkingSlotRepository;
        this.vehicleRepository = vehicleRepository;
    }

    // ============================================================
    // GET ALL BOOKINGS
    // ============================================================

    @GetMapping
    public ResponseEntity<?> getAllBookings() {

        try {

            List<ParkingBooking> bookings =
                    parkingBookingRepository.findAll();

            return ResponseEntity.ok(bookings);

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(
                            "Unable to load bookings: "
                                    + e.getClass().getName()
                                    + " | "
                                    + e.getMessage()
                    );
        }
    }

    // ============================================================
    // GET BOOKING BY ID
    // ============================================================

    @GetMapping("/{id}")
    public ResponseEntity<?> getBookingById(
            @PathVariable Integer id) {

        try {

            ParkingBooking booking =
                    parkingBookingRepository
                            .findById(id)
                            .orElse(null);

            if (booking == null) {

                return ResponseEntity
                        .status(HttpStatus.NOT_FOUND)
                        .body(
                                "Booking not found with ID: "
                                        + id
                        );
            }

            return ResponseEntity.ok(booking);

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(
                            "Unable to load booking: "
                                    + e.getClass().getName()
                                    + " | "
                                    + e.getMessage()
                    );
        }
    }

    // ============================================================
    // GET BOOKINGS BY USER
    // ============================================================

    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getBookingsByUser(
            @PathVariable Integer userId) {

        try {

            List<ParkingBooking> bookings =
                    parkingBookingRepository
                            .findByUserId(userId);

            return ResponseEntity.ok(bookings);

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(
                            "Unable to load user bookings: "
                                    + e.getClass().getName()
                                    + " | "
                                    + e.getMessage()
                    );
        }
    }

    // ============================================================
    // CREATE BOOKING
    // ============================================================

    @PostMapping
    public ResponseEntity<?> createBooking(
            @RequestBody ParkingBooking booking) {

        try {

            // ----------------------------------------------------
            // VALIDATE USER
            // ----------------------------------------------------

            if (booking.getUserId() == null) {

                return ResponseEntity
                        .badRequest()
                        .body("userId is required");
            }

            // ----------------------------------------------------
            // VALIDATE VEHICLE
            // ----------------------------------------------------

            if (booking.getVehicleId() == null) {

                return ResponseEntity
                        .badRequest()
                        .body("vehicleId is required");
            }

            Vehicle vehicle =
                    vehicleRepository
                            .findById(booking.getVehicleId())
                            .orElse(null);

            if (vehicle == null) {

                return ResponseEntity
                        .status(HttpStatus.NOT_FOUND)
                        .body("Vehicle not found");
            }

            // ----------------------------------------------------
            // CHECK VEHICLE OWNER
            // ----------------------------------------------------

            if (vehicle.getUserId() == null ||
                    !vehicle.getUserId()
                            .equals(booking.getUserId())) {

                return ResponseEntity
                        .status(HttpStatus.CONFLICT)
                        .body(
                                "Vehicle does not belong to this user"
                        );
            }

            // ----------------------------------------------------
            // VALIDATE SLOT
            // ----------------------------------------------------

            if (booking.getSlotId() == null) {

                return ResponseEntity
                        .badRequest()
                        .body("slotId is required");
            }

            ParkingSlot slot =
                    parkingSlotRepository
                            .findById(booking.getSlotId())
                            .orElse(null);

            if (slot == null) {

                return ResponseEntity
                        .status(HttpStatus.NOT_FOUND)
                        .body("Parking slot not found");
            }

            // ----------------------------------------------------
            // CHECK SLOT STATUS
            // ----------------------------------------------------

            if (!"AVAILABLE".equalsIgnoreCase(
                    slot.getStatus())) {

                return ResponseEntity
                        .status(HttpStatus.CONFLICT)
                        .body(
                                "Parking slot "
                                        + slot.getSlotNumber()
                                        + " is already occupied"
                        );
            }

            // ----------------------------------------------------
            // VALIDATE DURATION
            // ----------------------------------------------------

            if (booking.getDurationHours() == null ||
                    booking.getDurationHours() <= 0) {

                return ResponseEntity
                        .badRequest()
                        .body(
                                "durationHours must be greater than 0"
                        );
            }

            // ----------------------------------------------------
            // VALIDATE PRICE
            // ----------------------------------------------------

            if (slot.getPricePerHour() == null) {

                return ResponseEntity
                        .badRequest()
                        .body(
                                "Parking slot price is not configured"
                        );
            }

            // ----------------------------------------------------
            // BOOKING DATE
            // ----------------------------------------------------

            if (booking.getBookingDate() == null) {

                booking.setBookingDate(
                        LocalDate.now()
                );
            }

            // ----------------------------------------------------
            // ENTRY TIME
            // ----------------------------------------------------

            if (booking.getEntryTime() == null) {

                booking.setEntryTime(
                        java.time.LocalDateTime.now()
                );
            }

            // ----------------------------------------------------
            // CALCULATE AMOUNT
            // ----------------------------------------------------

            double amount =
                    slot.getPricePerHour().doubleValue()
                            * booking.getDurationHours();

            booking.setAmount(amount);

            // ----------------------------------------------------
            // STATUS
            // ----------------------------------------------------

            if (booking.getStatus() == null ||
                    booking.getStatus().trim().isEmpty()) {

                booking.setStatus("ACTIVE");
            }

            // ----------------------------------------------------
            // SAVE BOOKING
            // ----------------------------------------------------

            ParkingBooking savedBooking =
                    parkingBookingRepository.save(booking);

            // ----------------------------------------------------
            // UPDATE SLOT
            // ----------------------------------------------------

            slot.setStatus("OCCUPIED");

            parkingSlotRepository.save(slot);

            // ----------------------------------------------------
            // SUCCESS
            // ----------------------------------------------------

            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(savedBooking);

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(
                            "Booking creation failed: "
                                    + e.getClass().getName()
                                    + " | "
                                    + e.getMessage()
                    );
        }
    }

    // ============================================================
    // DELETE BOOKING
    // ============================================================

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteBooking(
            @PathVariable Integer id) {

        try {

            ParkingBooking booking =
                    parkingBookingRepository
                            .findById(id)
                            .orElse(null);

            if (booking == null) {

                return ResponseEntity
                        .status(HttpStatus.NOT_FOUND)
                        .body("Booking not found");
            }

            // ----------------------------------------------------
            // MAKE SLOT AVAILABLE
            // ----------------------------------------------------

            if (booking.getSlotId() != null) {

                ParkingSlot slot =
                        parkingSlotRepository
                                .findById(
                                        booking.getSlotId()
                                )
                                .orElse(null);

                if (slot != null) {

                    slot.setStatus("AVAILABLE");

                    parkingSlotRepository.save(slot);
                }
            }

            // ----------------------------------------------------
            // DELETE BOOKING
            // ----------------------------------------------------

            parkingBookingRepository.deleteById(id);

            return ResponseEntity.ok(
                    "Booking deleted successfully"
            );

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(
                            "Booking deletion failed: "
                                    + e.getClass().getName()
                                    + " | "
                                    + e.getMessage()
                    );
        }
    }
}