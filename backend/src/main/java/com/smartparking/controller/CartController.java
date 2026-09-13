package com.smartparking.controller;

import com.smartparking.entity.Cart;
import com.smartparking.repository.CartRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/cart")
@CrossOrigin(origins = {
        "http://localhost:5500",
        "http://127.0.0.1:5500"
})
public class CartController {

    private final CartRepository cartRepository;

    public CartController(CartRepository cartRepository) {
        this.cartRepository = cartRepository;
    }


    /* ============================================================
       GET USER CART
       ============================================================ */

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Cart>> getUserCart(
            @PathVariable Integer userId) {

        return ResponseEntity.ok(
                cartRepository.findByUserId(userId)
        );
    }


    /* ============================================================
       GET ALL CART ITEMS
       ============================================================ */

    @GetMapping
    public ResponseEntity<List<Cart>> getAllCartItems() {

        return ResponseEntity.ok(
                cartRepository.findAll()
        );
    }


    /* ============================================================
       GET CART ITEM BY ID
       ============================================================ */

    @GetMapping("/{id}")
    public ResponseEntity<?> getCartItem(
            @PathVariable Integer id) {

        Optional<Cart> cart =
                cartRepository.findById(id);

        if (cart.isEmpty()) {

            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body("Cart item not found");
        }

        return ResponseEntity.ok(
                cart.get()
        );
    }


    /* ============================================================
       ADD PRODUCT TO CART
       ============================================================ */

    @PostMapping
    public ResponseEntity<?> addToCart(
            @RequestBody Cart cart) {

        try {

            if (cart.getUserId() == null) {

                return ResponseEntity
                        .badRequest()
                        .body("User ID is required");
            }

            if (cart.getProductId() == null) {

                return ResponseEntity
                        .badRequest()
                        .body("Product ID is required");
            }

            if (cart.getQuantity() == null ||
                    cart.getQuantity() <= 0) {

                return ResponseEntity
                        .badRequest()
                        .body("Valid quantity is required");
            }

            if (cart.getPrice() == null ||
                    cart.getPrice() <= 0) {

                return ResponseEntity
                        .badRequest()
                        .body("Valid price is required");
            }


            /*
             * Check whether the product is
             * already present in the user's cart.
             */

            Optional<Cart> existingCart =
                    cartRepository
                            .findByUserIdAndProductId(
                                    cart.getUserId(),
                                    cart.getProductId()
                            );


            if (existingCart.isPresent()) {

                Cart existing =
                        existingCart.get();

                int newQuantity =
                        existing.getQuantity()
                                + cart.getQuantity();

                existing.setQuantity(
                        newQuantity
                );

                /*
                 * Keep the latest product price.
                 */

                existing.setPrice(
                        cart.getPrice()
                );

                Cart updated =
                        cartRepository.save(existing);

                return ResponseEntity.ok(
                        updated
                );
            }


            /*
             * New cart item
             */

            Cart saved =
                    cartRepository.save(cart);

            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(saved);


        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity
                    .status(
                            HttpStatus.INTERNAL_SERVER_ERROR
                    )
                    .body(
                            "Unable to add product to cart: "
                                    + e.getMessage()
                    );
        }
    }


    /* ============================================================
       UPDATE CART ITEM
       ============================================================ */

    @PutMapping("/{id}")
    public ResponseEntity<?> updateCartItem(
            @PathVariable Integer id,
            @RequestBody Cart cart) {

        try {

            Optional<Cart> existingCart =
                    cartRepository.findById(id);

            if (existingCart.isEmpty()) {

                return ResponseEntity
                        .status(HttpStatus.NOT_FOUND)
                        .body("Cart item not found");
            }


            if (cart.getQuantity() == null ||
                    cart.getQuantity() <= 0) {

                return ResponseEntity
                        .badRequest()
                        .body(
                                "Quantity must be greater than 0"
                        );
            }


            Cart existing =
                    existingCart.get();

            existing.setQuantity(
                    cart.getQuantity()
            );


            if (cart.getPrice() != null &&
                    cart.getPrice() > 0) {

                existing.setPrice(
                        cart.getPrice()
                );
            }


            Cart updated =
                    cartRepository.save(existing);

            return ResponseEntity.ok(
                    updated
            );


        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity
                    .status(
                            HttpStatus.INTERNAL_SERVER_ERROR
                    )
                    .body(
                            "Unable to update cart: "
                                    + e.getMessage()
                    );
        }
    }


    /* ============================================================
       DELETE CART ITEM
       ============================================================ */

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCartItem(
            @PathVariable Integer id) {

        Optional<Cart> cart =
                cartRepository.findById(id);

        if (cart.isEmpty()) {

            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body("Cart item not found");
        }

        cartRepository.deleteById(id);

        return ResponseEntity.ok(
                "Cart item removed successfully"
        );
    }


    /* ============================================================
       CLEAR USER CART
       ============================================================ */

    @DeleteMapping("/user/{userId}")
    public ResponseEntity<?> clearUserCart(
            @PathVariable Integer userId) {

        try {

            cartRepository.deleteByUserId(userId);

            return ResponseEntity.ok(
                    "Cart cleared successfully"
            );

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity
                    .status(
                            HttpStatus.INTERNAL_SERVER_ERROR
                    )
                    .body(
                            "Unable to clear cart: "
                                    + e.getMessage()
                    );
        }
    }
}