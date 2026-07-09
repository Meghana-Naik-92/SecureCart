package com.securecart.integration;

import java.math.BigDecimal;

import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.hasSize;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import org.springframework.transaction.annotation.Transactional;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.securecart.dto.CheckoutRequest;
import com.securecart.dto.LoginRequest;
import com.securecart.entity.Product;
import com.securecart.entity.Role;
import com.securecart.entity.User;
import com.securecart.repository.ProductRepository;
import com.securecart.repository.UserRepository;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
public class CartOrderIntegrationTest {

    @Autowired
    private MockMvc mockMvc;
    @Autowired
    private ObjectMapper objectMapper;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private ProductRepository productRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;

    private String accessToken;
    private Long productId;

    @BeforeEach
    void setUp() throws Exception {
        // Create test user
        User user = new User();
        user.setEmail("carttest@test.com");
        user.setPassword(passwordEncoder.encode("password123"));
        user.setRole(Role.USER);
        userRepository.save(user);

        // Create test product
        Product product = new Product();
        product.setName("Test Product");
        product.setDescription("Test Description");
        product.setPrice(new BigDecimal("999.99"));
        product.setStock(100);
        product.setCategory("Electronics");
        product.setImageUrl("https://example.com/test.jpg");
        Product saved = productRepository.save(product);
        productId = saved.getId();

        // Login and get token
        LoginRequest loginRequest = new LoginRequest();
        loginRequest.setEmail("carttest@test.com");
        loginRequest.setPassword("password123");

        MvcResult result = mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andReturn();

        String responseBody = result.getResponse().getContentAsString();
        accessToken = objectMapper.readTree(responseBody)
                .get("accessToken").asText();
    }

    @Test
    void addToCart_ThenCheckout_FullFlow() throws Exception {
        // Step 1 — Add to cart
        mockMvc.perform(post("/api/cart/add")
                .param("productId", productId.toString())
                .param("quantity", "2")
                .header("Authorization", "Bearer " + accessToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items", hasSize(1)))
                .andExpect(jsonPath("$.items[0].quantity").value(2))
                .andExpect(jsonPath("$.totalAmount").value(1999.98));

        // Step 2 — Checkout
        CheckoutRequest checkoutRequest = new CheckoutRequest();
        checkoutRequest.setShippingAddress("123 Test Street, Bengaluru");

        mockMvc.perform(post("/api/orders/checkout")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(checkoutRequest))
                .header("Authorization", "Bearer " + accessToken))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value("PLACED"))
                .andExpect(jsonPath("$.totalAmount").value(1999.98))
                .andExpect(jsonPath("$.items", hasSize(1)));

        // Step 3 — Cart should be empty after checkout
        mockMvc.perform(get("/api/cart")
                .header("Authorization", "Bearer " + accessToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items", hasSize(0)));

        // Step 4 — Order should appear in history
        mockMvc.perform(get("/api/orders/my-orders")
                .header("Authorization", "Bearer " + accessToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].status").value("PLACED"));
    }

    @Test
    void addToCart_InsufficientStock_Returns400() throws Exception {
        mockMvc.perform(post("/api/cart/add")
                .param("productId", productId.toString())
                .param("quantity", "9999")
                .header("Authorization", "Bearer " + accessToken))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message",
                        containsString("Insufficient stock")));
    }

    @Test
    void checkout_EmptyCart_Returns400() throws Exception {
        // First visit cart to create it
        mockMvc.perform(get("/api/cart")
                .header("Authorization", "Bearer " + accessToken))
                .andExpect(status().isOk());

        // Now try to checkout with empty cart
        CheckoutRequest checkoutRequest = new CheckoutRequest();
        checkoutRequest.setShippingAddress("123 Test Street");

        mockMvc.perform(post("/api/orders/checkout")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(checkoutRequest))
                .header("Authorization", "Bearer " + accessToken))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message")
                        .value("Cannot checkout with an empty cart"));
    }

    @Test
    void getCart_WithoutToken_Returns403() throws Exception {
        mockMvc.perform(get("/api/cart"))
                .andExpect(status().isForbidden());
    }
}
