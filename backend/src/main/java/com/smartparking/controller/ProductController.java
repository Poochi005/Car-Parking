package com.smartparking.controller;

import com.smartparking.entity.Product;
import com.smartparking.repository.ProductRepository;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
@CrossOrigin(origins = {
        "http://localhost:5500",
        "http://127.0.0.1:5500"
})
public class ProductController {

    private final ProductRepository productRepository;

    public ProductController(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    // GET ALL PRODUCTS
    @GetMapping
    public ResponseEntity<List<Product>> getAllProducts() {

        List<Product> products = productRepository.findAll();

        return ResponseEntity.ok(products);
    }

    // GET PRODUCT BY ID
    @GetMapping("/{id}")
    public ResponseEntity<?> getProductById(@PathVariable Integer id) {

        Product product =
                productRepository.findById(id).orElse(null);

        if (product == null) {
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body("Product not found");
        }

        return ResponseEntity.ok(product);
    }

    // GET ACTIVE PRODUCTS
    @GetMapping("/active")
    public ResponseEntity<List<Product>> getActiveProducts() {

        List<Product> products =
                productRepository.findByStatus("ACTIVE");

        return ResponseEntity.ok(products);
    }

    // ADD PRODUCT
    @PostMapping
    public ResponseEntity<Product> createProduct(
            @RequestBody Product product) {

        Product savedProduct =
                productRepository.save(product);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(savedProduct);
    }

    // UPDATE PRODUCT
    @PutMapping("/{id}")
    public ResponseEntity<?> updateProduct(
            @PathVariable Integer id,
            @RequestBody Product product) {

        Product existingProduct =
                productRepository.findById(id).orElse(null);

        if (existingProduct == null) {
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body("Product not found");
        }

        existingProduct.setName(product.getName());
        existingProduct.setCategory(product.getCategory());
        existingProduct.setDescription(product.getDescription());
        existingProduct.setPrice(product.getPrice());
        existingProduct.setStock(product.getStock());
        existingProduct.setImage(product.getImage());
        existingProduct.setStatus(product.getStatus());

        Product updatedProduct =
                productRepository.save(existingProduct);

        return ResponseEntity.ok(updatedProduct);
    }

    // DELETE PRODUCT
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteProduct(
            @PathVariable Integer id) {

        Product product =
                productRepository.findById(id).orElse(null);

        if (product == null) {
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body("Product not found");
        }

        productRepository.deleteById(id);

        return ResponseEntity.ok("Product deleted successfully");
    }
}