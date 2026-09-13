package com.smartparking.repository;

import com.smartparking.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PaymentRepository extends JpaRepository<Payment, Long> {

    List<Payment> findByUserId(Integer userId);

    List<Payment> findByBookingId(Integer bookingId);

    Optional<Payment> findByTransactionId(String transactionId);
}