package com.smartparking.repository;

import com.smartparking.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface OrderRepository extends JpaRepository<Order, Integer> {

    List<Order> findByUserId(Integer userId);

    Optional<Order> findByOrderNumber(String orderNumber);

    List<Order> findByOrderStatus(String orderStatus);

    List<Order> findByPaymentStatus(String paymentStatus);
}