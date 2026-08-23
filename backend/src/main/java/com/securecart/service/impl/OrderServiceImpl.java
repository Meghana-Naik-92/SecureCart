package com.securecart.service.impl;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.securecart.dto.CheckoutRequest;
import com.securecart.dto.OrderItemResponse;
import com.securecart.dto.OrderResponse;
import com.securecart.entity.Cart;
import com.securecart.entity.CartItem;
import com.securecart.entity.Order;
import com.securecart.entity.OrderItem;
import com.securecart.entity.OrderStatus;
import com.securecart.entity.Product;
import com.securecart.entity.User;
import com.securecart.exception.BadRequestException;
import com.securecart.exception.ResourceNotFoundException;
import com.securecart.repository.CartItemRepository;
import com.securecart.repository.CartRepository;
import com.securecart.repository.OrderItemRepository;
import com.securecart.repository.OrderRepository;
import com.securecart.repository.ProductRepository;
import com.securecart.repository.UserRepository;
import com.securecart.service.OrderService;

@Service
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    public OrderServiceImpl(OrderRepository orderRepository,
            OrderItemRepository orderItemRepository,
            CartRepository cartRepository,
            CartItemRepository cartItemRepository,
            ProductRepository productRepository,
            UserRepository userRepository) {
        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
        this.cartRepository = cartRepository;
        this.cartItemRepository = cartItemRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
    }

    private User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException(
                "User not found: " + email));
    }

    private OrderResponse buildOrderResponse(Order order) {
        List<OrderItemResponse> items = orderItemRepository.findByOrder(order)
                .stream()
                .map(item -> new OrderItemResponse(
                item.getId(),
                item.getProduct().getId(),
                item.getProduct().getName(),
                item.getQuantity(),
                item.getPriceAtPurchase()
        ))
                .collect(Collectors.toList());

        return new OrderResponse(
                order.getId(),
                order.getStatus(),
                order.getTotalAmount(),
                order.getShippingAddress(),
                items,
                order.getCreatedAt(),
                order.getUpdatedAt()
        );
    }

    @Override
    @Transactional
    public OrderResponse checkout(String email, CheckoutRequest request) {
        User user = getUserByEmail(email);

        // Get cart
        Cart cart = cartRepository.findByUser(user)
                .orElseThrow(() -> new BadRequestException(
                "Cart not found"));

        // Get cart items
        List<CartItem> cartItems = cartItemRepository.findByCart(cart);

        if (cartItems.isEmpty()) {
            throw new BadRequestException(
                    "Cannot checkout with an empty cart");
        }

        // Validate stock and calculate total — all inside transaction
        BigDecimal totalAmount = BigDecimal.ZERO;

        for (CartItem cartItem : cartItems) {
            Product product = cartItem.getProduct();
            int requestedQty = cartItem.getQuantity();

            // Re-fetch product with lock-safe check
            Product freshProduct = productRepository.findById(product.getId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                    "Product not found: " + product.getId()));

            if (freshProduct.getStock() < requestedQty) {
                throw new BadRequestException(
                        "Insufficient stock for product: " + freshProduct.getName()
                        + ". Available: " + freshProduct.getStock());
            }

            totalAmount = totalAmount.add(
                    freshProduct.getPrice().multiply(BigDecimal.valueOf(requestedQty)));
        }

        // Create order
        Order order = new Order();
        order.setUser(user);
        order.setStatus(OrderStatus.PLACED);
        order.setTotalAmount(totalAmount);
        order.setShippingAddress(request.getShippingAddress());
        Order savedOrder = orderRepository.save(order);

        // Create order items and decrement stock
        for (CartItem cartItem : cartItems) {
            Product freshProduct = productRepository.findById(
                    cartItem.getProduct().getId()).get();

            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(savedOrder);
            orderItem.setProduct(freshProduct);
            orderItem.setQuantity(cartItem.getQuantity());
            orderItem.setPriceAtPurchase(freshProduct.getPrice());
            orderItemRepository.save(orderItem);

            // Decrement stock
            freshProduct.setStock(freshProduct.getStock() - cartItem.getQuantity());
            productRepository.save(freshProduct);
        }

        // Clear cart after successful checkout
        cartItemRepository.deleteByCart(cart);

        return buildOrderResponse(savedOrder);
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrderResponse> getUserOrders(String email) {
        User user = getUserByEmail(email);
        return orderRepository.findByUserIdOrderByCreatedAtDesc(user.getId())
                .stream()
                .map(this::buildOrderResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrderResponse> getAllOrders() {
        return orderRepository.findAllWithUser()
                .stream()
                .map(this::buildOrderResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public OrderResponse getOrderById(String email, Long orderId) {
        User user = getUserByEmail(email);
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException(
                "Order not found with id: " + orderId));

        // Users can only see their own orders
        if (!order.getUser().getId().equals(user.getId())) {
            throw new BadRequestException(
                    "You are not authorized to view this order");
        }

        return buildOrderResponse(order);
    }
}
