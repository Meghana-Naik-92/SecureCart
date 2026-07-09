package com.securecart.service;

import com.securecart.dto.CartResponse;

public interface CartService {

    CartResponse getCart(String email);

    CartResponse addToCart(String email, Long productId, Integer quantity);

    CartResponse updateCartItem(String email, Long productId, Integer quantity);

    void removeFromCart(String email, Long productId);

    void clearCart(String email);
}
