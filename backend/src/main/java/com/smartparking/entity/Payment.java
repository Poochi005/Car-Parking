package com.smartparking.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "payments")
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Integer userId;

    private Integer bookingId;

    private Double amount;

    private String paymentMethod;

    private String paymentStatus;

    private String transactionId;

    private LocalDateTime paymentDate;


    // Default Constructor
    public Payment() {
    }


    // Get ID
    public Long getId() {
        return id;
    }

    // Set ID
    public void setId(Long id) {
        this.id = id;
    }


    // Get User ID
    public Integer getUserId() {
        return userId;
    }

    // Set User ID
    public void setUserId(Integer userId) {
        this.userId = userId;
    }


    // Get Booking ID
    public Integer getBookingId() {
        return bookingId;
    }

    // Set Booking ID
    public void setBookingId(Integer bookingId) {
        this.bookingId = bookingId;
    }


    // Get Amount
    public Double getAmount() {
        return amount;
    }

    // Set Amount
    public void setAmount(Double amount) {
        this.amount = amount;
    }


    // Get Payment Method
    public String getPaymentMethod() {
        return paymentMethod;
    }

    // Set Payment Method
    public void setPaymentMethod(String paymentMethod) {
        this.paymentMethod = paymentMethod;
    }


    // Get Payment Status
    public String getPaymentStatus() {
        return paymentStatus;
    }

    // Set Payment Status
    public void setPaymentStatus(String paymentStatus) {
        this.paymentStatus = paymentStatus;
    }


    // Get Transaction ID
    public String getTransactionId() {
        return transactionId;
    }

    // Set Transaction ID
    public void setTransactionId(String transactionId) {
        this.transactionId = transactionId;
    }


    // Get Payment Date
    public LocalDateTime getPaymentDate() {
        return paymentDate;
    }

    // Set Payment Dateī
    public void setPaymentDate(LocalDateTime paymentDate) {
        this.paymentDate = paymentDate;
    }
}