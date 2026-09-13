package com.smartparking.controller;

import com.smartparking.entity.Payment;
import com.smartparking.repository.PaymentRepository;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    private final PaymentRepository paymentRepository;

    // =========================================================
    // CONSTRUCTOR
    // =========================================================

    public PaymentController(PaymentRepository paymentRepository) {
        this.paymentRepository = paymentRepository;
    }

    // =========================================================
    // CREATE PAYMENT
    // POST /api/payments
    // =========================================================

    @PostMapping
    public ResponseEntity<?> createPayment(
            @RequestBody Payment payment) {

        try {

            // -------------------------------------------------
            // VALIDATE USER ID
            // -------------------------------------------------

            if (payment.getUserId() == null) {

                return ResponseEntity
                        .badRequest()
                        .body("User ID is required");
            }

            // -------------------------------------------------
            // VALIDATE BOOKING ID
            // -------------------------------------------------

            if (payment.getBookingId() == null) {

                return ResponseEntity
                        .badRequest()
                        .body("Booking ID is required");
            }

            // -------------------------------------------------
            // VALIDATE AMOUNT
            // -------------------------------------------------

            if (payment.getAmount() == null ||
                    payment.getAmount() <= 0) {

                return ResponseEntity
                        .badRequest()
                        .body("Valid payment amount is required");
            }

            // -------------------------------------------------
            // VALIDATE PAYMENT METHOD
            // -------------------------------------------------

            if (payment.getPaymentMethod() == null ||
                    payment.getPaymentMethod().trim().isEmpty()) {

                return ResponseEntity
                        .badRequest()
                        .body("Payment method is required");
            }

            // -------------------------------------------------
            // GENERATE TRANSACTION ID
            // -------------------------------------------------

            String transactionId =
                    "TXN-" +
                    UUID.randomUUID()
                            .toString()
                            .substring(0, 8)
                            .toUpperCase();

            payment.setTransactionId(transactionId);

            // -------------------------------------------------
            // PAYMENT STATUS
            // -------------------------------------------------

            payment.setPaymentStatus("SUCCESS");

            // -------------------------------------------------
            // PAYMENT DATE
            // -------------------------------------------------

            payment.setPaymentDate(
                    LocalDateTime.now()
            );

            // -------------------------------------------------
            // SAVE PAYMENT
            // -------------------------------------------------

            Payment savedPayment =
                    paymentRepository.save(payment);

            // -------------------------------------------------
            // RETURN SUCCESS
            // -------------------------------------------------

            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(savedPayment);

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(
                            "Payment failed: " +
                            e.getMessage()
                    );
        }
    }

    // =========================================================
    // GET ALL PAYMENTS
    // GET /api/payments
    // =========================================================

    @GetMapping
    public ResponseEntity<?> getAllPayments() {

        try {

            return ResponseEntity.ok(
                    paymentRepository.findAll()
            );

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(
                            "Unable to load payments: " +
                            e.getClass().getName() +
                            " | " +
                            e.getMessage()
                    );
        }
    }

    // =========================================================
    // GET PAYMENT BY ID
    // GET /api/payments/{id}
    // =========================================================

    @GetMapping("/{id}")
    public ResponseEntity<?> getPaymentById(
            @PathVariable Long id) {

        Payment payment =
                paymentRepository
                        .findById(id)
                        .orElse(null);

        if (payment == null) {

            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body("Payment not found");
        }

        return ResponseEntity.ok(payment);
    }

    // =========================================================
    // GET PAYMENTS BY USER
    // GET /api/payments/user/{userId}
    // =========================================================

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Payment>> getPaymentsByUser(
            @PathVariable Integer userId) {

        return ResponseEntity.ok(
                paymentRepository.findByUserId(userId)
        );
    }

    // =========================================================
    // GET PAYMENTS BY BOOKING
    // GET /api/payments/booking/{bookingId}
    // =========================================================

    @GetMapping("/booking/{bookingId}")
    public ResponseEntity<List<Payment>> getPaymentsByBooking(
            @PathVariable Integer bookingId) {

        return ResponseEntity.ok(
                paymentRepository.findByBookingId(bookingId)
        );
    }
}