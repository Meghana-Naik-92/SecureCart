package com.securecart.service;

import java.math.BigDecimal;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.securecart.dto.ProductRequest;
import com.securecart.dto.ProductResponse;

public interface ProductService {

    ProductResponse createProduct(ProductRequest request);

    ProductResponse updateProduct(Long id, ProductRequest request);

    void deleteProduct(Long id);

    ProductResponse getProductById(Long id);

    Page<ProductResponse> getAllProducts(Pageable pageable);

    Page<ProductResponse> searchByName(String name, Pageable pageable);

    Page<ProductResponse> filterProducts(String category, BigDecimal minPrice,
            BigDecimal maxPrice, Pageable pageable);
}
