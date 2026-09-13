package com.smartparking.controller;

import com.smartparking.entity.Order;
import com.smartparking.repository.OrderRepository;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = {
        "http://localhost:5500",
        "http://127.0.0.1:5500"
})
public class OrderController {

    private final OrderRepository orderRepository;

    public OrderController(OrderRepository orderRepository) {
        this.orderRepository = orderRepository;
    }

    // CREATE ORDER
    @PostMapping
    public ResponseEntity<?> createOrder(@RequestBody Order order) {

        try {

            if (order.getUserId() == null) {
                return ResponseEntity
                        .badRequest()
                        .body("User ID is required");
            }

            if (order.getTotalAmount() == null ||
                    order.getTotalAmount() <= 0) {

                return ResponseEntity
                        .badRequest()
                        .body("Valid total amount is required");
            }

            if (order.getCustomerName() == null ||
                    order.getCustomerName().trim().isEmpty()) {

                return ResponseEntity
                        .badRequest()
                        .body("Customer name is required");
            }

            if (order.getCustomerEmail() == null ||
                    order.getCustomerEmail().trim().isEmpty()) {

                return ResponseEntity
                        .badRequest()
                        .body("Customer email is required");
            }

            if (order.getDeliveryAddress() == null ||
                    order.getDeliveryAddress().trim().isEmpty()) {

                return ResponseEntity
                        .badRequest()
                        .body("Delivery address is required");
            }

            if (order.getPaymentMethod() == null ||
                    order.getPaymentMethod().trim().isEmpty()) {

                return ResponseEntity
                        .badRequest()
                        .body("Payment method is required");
            }

            // Default status
            if (order.getOrderStatus() == null ||
                    order.getOrderStatus().trim().isEmpty()) {

                order.setOrderStatus("PLACED");
            }

            // Payment status
            if (order.getPaymentStatus() == null ||
                    order.getPaymentStatus().trim().isEmpty()) {

                if ("COD".equalsIgnoreCase(order.getPaymentMethod())) {
                    order.setPaymentStatus("PENDING");
                } else {
                    order.setPaymentStatus("SUCCESS");
                }
            }

            Order savedOrder = orderRepository.save(order);

            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(savedOrder);

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Order creation failed: " + e.getMessage());
        }
    }


    // GET ALL ORDERS
    @GetMapping
    public ResponseEntity<?> getAllOrders() {

        try {

            List<Order> orders = orderRepository.findAll();

            return ResponseEntity.ok(orders);

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Unable to load orders: " + e.getMessage());
        }
    }


    // GET ORDER BY ID
    @GetMapping("/{id}")
    public ResponseEntity<?> getOrderById(
            @PathVariable Integer id) {

        Order order = orderRepository
                .findById(id)
                .orElse(null);

        if (order == null) {

            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body("Order not found");
        }

        return ResponseEntity.ok(order);
    }


    // GET ORDERS BY USER
    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getOrdersByUser(
            @PathVariable Integer userId) {

        try {

            List<Order> orders =
                    orderRepository.findByUserId(userId);

            return ResponseEntity.ok(orders);

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Unable to load user orders: "
                            + e.getMessage());
        }
    }


    // UPDATE ORDER STATUS
    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateOrderStatus(
            @PathVariable Integer id,
            @RequestParam String status) {

        Order order = orderRepository
                .findById(id)
                .orElse(null);

        if (order == null) {

            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body("Order not found");
        }

        order.setOrderStatus(status.toUpperCase());

        Order updatedOrder =
                orderRepository.save(order);

        return ResponseEntity.ok(updatedOrder);
    }


    // UPDATE PAYMENT STATUS
    @PutMapping("/{id}/payment-status")
    public ResponseEntity<?> updatePaymentStatus(
            @PathVariable Integer id,
            @RequestParam String status) {

        Order order = orderRepository
                .findById(id)
                .orElse(null);

        if (order == null) {

            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body("Order not found");
        }

        order.setPaymentStatus(status.toUpperCase());

        Order updatedOrder =
                orderRepository.save(order);

        return ResponseEntity.ok(updatedOrder);
    }


    // DELETE ORDER
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteOrder(
            @PathVariable Integer id) {

        Order order = orderRepository
                .findById(id)
                .orElse(null);

        if (order == null) {

            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body("Order not found");
        }

        orderRepository.deleteById(id);

        return ResponseEntity.ok(
                "Order deleted successfully"
        );
    }
}