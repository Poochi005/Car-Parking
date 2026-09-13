package com.smartparking.repository;

import com.smartparking.entity.Product;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProductRepository
        extends JpaRepository<Product, Integer> {

    List<Product> findByStatus(String status);

    List<Product> findByCategory(String category);

    List<Product> findByNameContainingIgnoreCase(String name);
}