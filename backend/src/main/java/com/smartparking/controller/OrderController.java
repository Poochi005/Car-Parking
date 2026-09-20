package com.smartparking.controller;

import com.smartparking.entity.Cart;
import com.smartparking.entity.Order;
import com.smartparking.entity.OrderItem;
import com.smartparking.repository.CartRepository;
import com.smartparking.repository.OrderItemRepository;
import com.smartparking.repository.OrderRepository;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
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
    private final OrderItemRepository orderItemRepository;
    private final CartRepository cartRepository;

    public OrderController(
            OrderRepository orderRepository,
            OrderItemRepository orderItemRepository,
            CartRepository cartRepository) {

        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
        this.cartRepository = cartRepository;
    }

    // ============================================================
    // CREATE ORDER
    // ============================================================

    @PostMapping
    @Transactional
    public ResponseEntity<?> createOrder(
            @RequestBody Order order) {

        try {

            // ----------------------------------------------------
            // VALIDATION
            // ----------------------------------------------------

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

            // ----------------------------------------------------
            // ORDER STATUS
            // ----------------------------------------------------

            if (order.getOrderStatus() == null ||
                    order.getOrderStatus().trim().isEmpty()) {

                order.setOrderStatus("PLACED");
            }

            // ----------------------------------------------------
            // PAYMENT STATUS
            // ----------------------------------------------------

            if (order.getPaymentStatus() == null ||
                    order.getPaymentStatus().trim().isEmpty()) {

                if ("COD".equalsIgnoreCase(
                        order.getPaymentMethod())) {

                    order.setPaymentStatus("PENDING");

                } else {

                    order.setPaymentStatus("SUCCESS");
                }
            }

            // ----------------------------------------------------
            // GET USER CART
            // ----------------------------------------------------

            List<Cart> cartItems =
                    cartRepository.findByUserId(
                            order.getUserId()
                    );

            if (cartItems == null ||
                    cartItems.isEmpty()) {

                return ResponseEntity
                        .badRequest()
                        .body(
                                "Cart is empty. Add products before placing an order."
                        );
            }

            // ----------------------------------------------------
            // SAVE ORDER
            // ----------------------------------------------------

            Order savedOrder =
                    orderRepository.save(order);

            // ----------------------------------------------------
            // CREATE ORDER ITEMS
            // ----------------------------------------------------

            for (Cart cart : cartItems) {

                if (cart.getProductId() == null) {
                    continue;
                }

                if (cart.getQuantity() == null ||
                        cart.getQuantity() <= 0) {
                    continue;
                }

                if (cart.getPrice() == null ||
                        cart.getPrice() <= 0) {
                    continue;
                }

                OrderItem orderItem =
                        new OrderItem();

                // Order ID
                orderItem.setOrderId(
                        savedOrder.getId()
                );

                // Product ID
                orderItem.setProductId(
                        cart.getProductId()
                );

                // Quantity
                orderItem.setQuantity(
                        cart.getQuantity()
                );

                // Price
                orderItem.setPrice(
                        cart.getPrice()
                );

                // Subtotal
                double subtotal =
                        cart.getPrice()
                                * cart.getQuantity();

                orderItem.setSubtotal(
                        subtotal
                );

                // Save item
                orderItemRepository.save(
                        orderItem
                );
            }

            // ----------------------------------------------------
            // CLEAR CART
            // ----------------------------------------------------

            cartRepository.deleteByUserId(
                    order.getUserId()
            );

            // ----------------------------------------------------
            // SUCCESS
            // ----------------------------------------------------

            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(savedOrder);

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity
                    .status(
                            HttpStatus.INTERNAL_SERVER_ERROR
                    )
                    .body(
                            "Order creation failed: "
                                    + e.getMessage()
                    );
        }
    }

    // ============================================================
    // GET ALL ORDERS
    // ============================================================

    @GetMapping
    public ResponseEntity<?> getAllOrders() {

        try {

            List<Order> orders =
                    orderRepository.findAll();

            return ResponseEntity.ok(orders);

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity
                    .status(
                            HttpStatus.INTERNAL_SERVER_ERROR
                    )
                    .body(
                            "Unable to load orders: "
                                    + e.getMessage()
                    );
        }
    }

    // ============================================================
    // GET ORDER BY ID
    // ============================================================

    @GetMapping("/{id}")
    public ResponseEntity<?> getOrderById(
            @PathVariable Integer id) {

        Order order =
                orderRepository
                        .findById(id)
                        .orElse(null);

        if (order == null) {

            return ResponseEntity
                    .status(
                            HttpStatus.NOT_FOUND
                    )
                    .body("Order not found");
        }

        return ResponseEntity.ok(order);
    }

    // ============================================================
    // GET ORDERS BY USER
    // ============================================================

    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getOrdersByUser(
            @PathVariable Integer userId) {

        try {

            List<Order> orders =
                    orderRepository
                            .findByUserId(userId);

            return ResponseEntity.ok(orders);

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity
                    .status(
                            HttpStatus.INTERNAL_SERVER_ERROR
                    )
                    .body(
                            "Unable to load user orders: "
                                    + e.getMessage()
                    );
        }
    }

    // ============================================================
    // GET ORDER ITEMS
    // ============================================================

    @GetMapping("/{id}/items")
    public ResponseEntity<?> getOrderItems(
            @PathVariable Integer id) {

        try {

            Order order =
                    orderRepository
                            .findById(id)
                            .orElse(null);

            if (order == null) {

                return ResponseEntity
                        .status(
                                HttpStatus.NOT_FOUND
                        )
                        .body("Order not found");
            }

            List<OrderItem> items =
                    orderItemRepository
                            .findByOrderId(id);

            return ResponseEntity.ok(items);

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity
                    .status(
                            HttpStatus.INTERNAL_SERVER_ERROR
                    )
                    .body(
                            "Unable to load order items: "
                                    + e.getMessage()
                    );
        }
    }

    // ============================================================
    // UPDATE ORDER STATUS
    // ============================================================

    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateOrderStatus(
            @PathVariable Integer id,
            @RequestParam String status) {

        Order order =
                orderRepository
                        .findById(id)
                        .orElse(null);

        if (order == null) {

            return ResponseEntity
                    .status(
                            HttpStatus.NOT_FOUND
                    )
                    .body("Order not found");
        }

        order.setOrderStatus(
                status.toUpperCase()
        );

        Order updatedOrder =
                orderRepository.save(order);

        return ResponseEntity.ok(
                updatedOrder
        );
    }

    // ============================================================
    // UPDATE PAYMENT STATUS
    // ============================================================

    @PutMapping("/{id}/payment-status")
    public ResponseEntity<?> updatePaymentStatus(
            @PathVariable Integer id,
            @RequestParam String status) {

        Order order =
                orderRepository
                        .findById(id)
                        .orElse(null);

        if (order == null) {

            return ResponseEntity
                    .status(
                            HttpStatus.NOT_FOUND
                    )
                    .body("Order not found");
        }

        order.setPaymentStatus(
                status.toUpperCase()
        );

        Order updatedOrder =
                orderRepository.save(order);

        return ResponseEntity.ok(
                updatedOrder
        );
    }

    // ============================================================
    // DELETE ORDER
    // ============================================================

    @DeleteMapping("/{id}")
    @Transactional
    public ResponseEntity<?> deleteOrder(
            @PathVariable Integer id) {

        Order order =
                orderRepository
                        .findById(id)
                        .orElse(null);

        if (order == null) {

            return ResponseEntity
                    .status(
                            HttpStatus.NOT_FOUND
                    )
                    .body("Order not found");
        }

        // Delete order items first
        orderItemRepository.deleteByOrderId(id);

        // Delete order
        orderRepository.deleteById(id);

        return ResponseEntity.ok(
                "Order deleted successfully"
        );
    }
}