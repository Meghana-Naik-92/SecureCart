package com.securecart.service;

import java.util.List;

import com.securecart.dto.CheckoutRequest;
import com.securecart.dto.OrderResponse;

public interface OrderService {

    OrderResponse checkout(String email, CheckoutRequest request);

    List<OrderResponse> getUserOrders(String email);

    List<OrderResponse> getAllOrders();

    OrderResponse getOrderById(String email, Long orderId);
}
