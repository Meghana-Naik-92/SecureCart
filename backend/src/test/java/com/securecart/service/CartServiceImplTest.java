package com.securecart.service;

import com.securecart.dto.CartResponse;
import com.securecart.entity.*;
import com.securecart.exception.BadRequestException;
import com.securecart.exception.ResourceNotFoundException;
import com.securecart.repository.*;
import com.securecart.service.impl.CartServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CartServiceImplTest {

    @Mock
    private CartRepository cartRepository;
    @Mock
    private CartItemRepository cartItemRepository;
    @Mock
    private ProductRepository productRepository;
    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private CartServiceImpl cartService;

    private User testUser;
    private Cart testCart;
    private Product testProduct;
    private CartItem testCartItem;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setId(1L);
        testUser.setEmail("test@example.com");

        testCart = new Cart();
        testCart.setId(1L);
        testCart.setUser(testUser);

        testProduct = new Product();
        testProduct.setId(1L);
        testProduct.setName("Wireless Headphones");
        testProduct.setPrice(new BigDecimal("2999.99"));
        testProduct.setStock(50);
        testProduct.setImageUrl("https://example.com/headphones.jpg");

        testCartItem = new CartItem();
        testCartItem.setId(1L);
        testCartItem.setCart(testCart);
        testCartItem.setProduct(testProduct);
        testCartItem.setQuantity(2);
    }

    @Test
    void getCart_Success_ReturnsEmptyCart() {
        when(userRepository.findByEmail("test@example.com"))
                .thenReturn(Optional.of(testUser));
        when(cartRepository.findByUser(testUser))
                .thenReturn(Optional.of(testCart));
        when(cartItemRepository.findByCart(testCart))
                .thenReturn(Collections.emptyList());

        CartResponse response = cartService.getCart("test@example.com");

        assertNotNull(response);
        assertEquals(0, response.getItems().size());
        assertEquals(BigDecimal.ZERO, response.getTotalAmount());
    }

    @Test
    void getCart_UserNotFound_ThrowsResourceNotFoundException() {
        when(userRepository.findByEmail("unknown@example.com"))
                .thenReturn(Optional.empty());

        assertThrows(
                ResourceNotFoundException.class,
                () -> cartService.getCart("unknown@example.com")
        );
    }

    @Test
    void addToCart_Success() {
        when(userRepository.findByEmail("test@example.com"))
                .thenReturn(Optional.of(testUser));
        when(cartRepository.findByUser(testUser))
                .thenReturn(Optional.of(testCart));
        when(productRepository.findById(1L))
                .thenReturn(Optional.of(testProduct));
        when(cartItemRepository.findByCartAndProduct(testCart, testProduct))
                .thenReturn(Optional.empty());
        when(cartItemRepository.save(any(CartItem.class)))
                .thenReturn(testCartItem);
        when(cartItemRepository.findByCart(testCart))
                .thenReturn(List.of(testCartItem));

        CartResponse response = cartService.addToCart("test@example.com", 1L, 2);

        assertNotNull(response);
        assertEquals(1, response.getItems().size());
        verify(cartItemRepository, times(1)).save(any(CartItem.class));
    }

    @Test
    void addToCart_InsufficientStock_ThrowsBadRequestException() {
        when(userRepository.findByEmail("test@example.com"))
                .thenReturn(Optional.of(testUser));
        when(cartRepository.findByUser(testUser))
                .thenReturn(Optional.of(testCart));
        when(productRepository.findById(1L))
                .thenReturn(Optional.of(testProduct));

        BadRequestException exception = assertThrows(
                BadRequestException.class,
                () -> cartService.addToCart("test@example.com", 1L, 9999)
        );
        assertTrue(exception.getMessage().contains("Insufficient stock"));
    }

    @Test
    void addToCart_ProductNotFound_ThrowsResourceNotFoundException() {
        when(userRepository.findByEmail("test@example.com"))
                .thenReturn(Optional.of(testUser));
        when(cartRepository.findByUser(testUser))
                .thenReturn(Optional.of(testCart));
        when(productRepository.findById(99L))
                .thenReturn(Optional.empty());

        assertThrows(
                ResourceNotFoundException.class,
                () -> cartService.addToCart("test@example.com", 99L, 1)
        );
    }

    @Test
    void removeFromCart_Success() {
        when(userRepository.findByEmail("test@example.com"))
                .thenReturn(Optional.of(testUser));
        when(cartRepository.findByUser(testUser))
                .thenReturn(Optional.of(testCart));
        when(productRepository.findById(1L))
                .thenReturn(Optional.of(testProduct));
        when(cartItemRepository.findByCartAndProduct(testCart, testProduct))
                .thenReturn(Optional.of(testCartItem));

        cartService.removeFromCart("test@example.com", 1L);

        verify(cartItemRepository, times(1)).delete(testCartItem);
    }
}
