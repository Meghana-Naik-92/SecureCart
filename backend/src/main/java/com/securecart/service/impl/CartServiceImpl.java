package com.securecart.service.impl;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.securecart.dto.CartItemResponse;
import com.securecart.dto.CartResponse;
import com.securecart.entity.Cart;
import com.securecart.entity.CartItem;
import com.securecart.entity.Product;
import com.securecart.entity.User;
import com.securecart.exception.BadRequestException;
import com.securecart.exception.ResourceNotFoundException;
import com.securecart.repository.CartItemRepository;
import com.securecart.repository.CartRepository;
import com.securecart.repository.ProductRepository;
import com.securecart.repository.UserRepository;
import com.securecart.service.CartService;

@Service
public class CartServiceImpl implements CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    public CartServiceImpl(CartRepository cartRepository,
            CartItemRepository cartItemRepository,
            ProductRepository productRepository,
            UserRepository userRepository) {
        this.cartRepository = cartRepository;
        this.cartItemRepository = cartItemRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
    }

    // Gets or creates a cart for the user
    private Cart getOrCreateCart(User user) {
        return cartRepository.findByUser(user)
                .orElseGet(() -> {
                    Cart newCart = new Cart();
                    newCart.setUser(user);
                    return cartRepository.save(newCart);
                });
    }

    private User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException(
                "User not found: " + email));
    }

    private CartResponse buildCartResponse(Cart cart) {
        List<CartItemResponse> items = cartItemRepository.findByCart(cart)
                .stream()
                .map(item -> new CartItemResponse(
                item.getId(),
                item.getProduct().getId(),
                item.getProduct().getName(),
                item.getProduct().getImageUrl(),
                item.getProduct().getPrice(),
                item.getQuantity()
        ))
                .collect(Collectors.toList());
        return new CartResponse(cart.getId(), items);
    }

    @Override
    @Transactional
    public CartResponse getCart(String email) {
        User user = getUserByEmail(email);
        Cart cart = getOrCreateCart(user);
        return buildCartResponse(cart);
    }

    @Override
    @Transactional
    public CartResponse addToCart(String email, Long productId, Integer quantity) {
        User user = getUserByEmail(email);
        Cart cart = getOrCreateCart(user);

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException(
                "Product not found with id: " + productId));

        // Stock validation
        if (product.getStock() < quantity) {
            throw new BadRequestException("Insufficient stock. Available: "
                    + product.getStock());
        }

        // If product already in cart, increment quantity
        Optional<CartItem> existingItem
                = cartItemRepository.findByCartAndProduct(cart, product);

        if (existingItem.isPresent()) {
            CartItem item = existingItem.get();
            int newQuantity = item.getQuantity() + quantity;
            if (product.getStock() < newQuantity) {
                throw new BadRequestException("Insufficient stock. Available: "
                        + product.getStock());
            }
            item.setQuantity(newQuantity);
            cartItemRepository.save(item);
        } else {
            CartItem newItem = new CartItem();
            newItem.setCart(cart);
            newItem.setProduct(product);
            newItem.setQuantity(quantity);
            cartItemRepository.save(newItem);
        }

        return buildCartResponse(cart);
    }

    @Override
    @Transactional
    public CartResponse updateCartItem(String email, Long productId, Integer quantity) {
        User user = getUserByEmail(email);
        Cart cart = getOrCreateCart(user);

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException(
                "Product not found with id: " + productId));

        CartItem item = cartItemRepository.findByCartAndProduct(cart, product)
                .orElseThrow(() -> new ResourceNotFoundException(
                "Item not found in cart"));

        if (quantity <= 0) {
            cartItemRepository.delete(item);
        } else {
            if (product.getStock() < quantity) {
                throw new BadRequestException("Insufficient stock. Available: "
                        + product.getStock());
            }
            item.setQuantity(quantity);
            cartItemRepository.save(item);
        }

        return buildCartResponse(cart);
    }

    @Override
    @Transactional
    public void removeFromCart(String email, Long productId) {
        User user = getUserByEmail(email);
        Cart cart = getOrCreateCart(user);

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException(
                "Product not found with id: " + productId));

        CartItem item = cartItemRepository.findByCartAndProduct(cart, product)
                .orElseThrow(() -> new ResourceNotFoundException(
                "Item not found in cart"));

        cartItemRepository.delete(item);
    }

    @Override
    @Transactional
    public void clearCart(String email) {
        User user = getUserByEmail(email);
        Cart cart = getOrCreateCart(user);
        cartItemRepository.deleteByCart(cart);
    }
}
