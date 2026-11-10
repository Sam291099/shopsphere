
package com.shopsphere.order.service;

import com.shopsphere.order.dto.OrderItemRequest;
import com.shopsphere.order.dto.OrderItemResponse;
import com.shopsphere.order.dto.OrderRequest;
import com.shopsphere.order.dto.OrderResponse;
import com.shopsphere.order.entity.Order;
import com.shopsphere.order.entity.OrderItem;
import com.shopsphere.order.entity.OrderStatus;
import com.shopsphere.order.repository.OrderRepository;
import com.shopsphere.product.entity.Product;
import com.shopsphere.product.repository.ProductRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.UUID;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;

    public OrderService(
            OrderRepository orderRepository,
            ProductRepository productRepository
    ) {
        this.orderRepository = orderRepository;
        this.productRepository = productRepository;
    }

    @Transactional
    public OrderResponse createOrder(OrderRequest request) {

        // Validate that the request contains products
        if (request.getItems() == null || request.getItems().isEmpty()) {
            throw new IllegalArgumentException(
                    "Order must contain at least one product"
            );
        }

        // Prevent duplicate product IDs in one order
        HashSet<Long> productIds = new HashSet<>();

        for (OrderItemRequest itemRequest : request.getItems()) {

            if (itemRequest.getProductId() == null ||
                    itemRequest.getQuantity() == null ||
                    itemRequest.getQuantity() < 1) {
                throw new IllegalArgumentException(
                        "Invalid product ID or quantity"
                );
            }

            if (!productIds.add(itemRequest.getProductId())) {
                throw new IllegalArgumentException(
                        "Duplicate products are not allowed in one order"
                );
            }
        }

        // Create the order
        Order order = new Order();

        order.setOrderNumber(
                "SS-" + UUID.randomUUID()
                        .toString()
                        .substring(0, 12)
                        .toUpperCase()
        );

        order.setCustomerName(request.getCustomerName().trim());
        order.setCustomerEmail(request.getCustomerEmail().trim());
        order.setCustomerPhone(request.getCustomerPhone().trim());
        order.setDeliveryAddress(request.getDeliveryAddress().trim());
        order.setStatus(OrderStatus.PENDING);

        BigDecimal totalAmount = BigDecimal.ZERO;

        // Process each product
        for (OrderItemRequest itemRequest : request.getItems()) {

            Product product = productRepository
                    .findById(itemRequest.getProductId())
                    .orElseThrow(() -> new IllegalArgumentException(
                            "Product not found: " + itemRequest.getProductId()
                    ));

            int quantity = itemRequest.getQuantity();

            // Check product availability
            if (!Boolean.TRUE.equals(product.getActive())) {
                throw new IllegalArgumentException(
                        product.getName() + " is currently unavailable"
                );
            }

            // Check stock
            if (product.getStockQuantity() < quantity) {
                throw new IllegalArgumentException(
                        "Insufficient stock for " + product.getName()
                );
            }

            // Always use database price
            BigDecimal unitPrice = product.getPrice();

            BigDecimal subtotal = unitPrice.multiply(
                    BigDecimal.valueOf(quantity)
            );

            // Create order item
            OrderItem orderItem = new OrderItem();

            orderItem.setProduct(product);
            orderItem.setProductName(product.getName());
            orderItem.setProductSku(product.getSku());
            orderItem.setUnitPrice(unitPrice);
            orderItem.setQuantity(quantity);
            orderItem.setSubtotal(subtotal);

            order.addItem(orderItem);

            // Calculate total
            totalAmount = totalAmount.add(subtotal);

            // Reduce stock
            product.setStockQuantity(
                    product.getStockQuantity() - quantity
            );
        }

        order.setTotalAmount(totalAmount);

        // Save order and associated order items
        Order savedOrder = orderRepository.save(order);

        return mapToResponse(savedOrder);
    }

    @Transactional(readOnly = true)
    public OrderResponse getOrderByNumber(String orderNumber) {

        Order order = orderRepository
                .findByOrderNumber(orderNumber)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Order not found: " + orderNumber
                ));

        return mapToResponse(order);
    }

    private OrderResponse mapToResponse(Order order) {

        List<OrderItemResponse> itemResponses = new ArrayList<>();

        for (OrderItem item : order.getItems()) {

            itemResponses.add(
                    new OrderItemResponse(
                            item.getProduct().getId(),
                            item.getProductName(),
                            item.getProductSku(),
                            item.getUnitPrice(),
                            item.getQuantity(),
                            item.getSubtotal()
                    )
            );
        }

        return new OrderResponse(
                order.getId(),
                order.getOrderNumber(),
                order.getCustomerName(),
                order.getCustomerEmail(),
                order.getCustomerPhone(),
                order.getDeliveryAddress(),
                order.getTotalAmount(),
                order.getStatus(),
                order.getCreatedAt(),
                itemResponses
        );
    }
    @Transactional(readOnly = true)
public List<OrderResponse> getAllOrders() {
    return orderRepository.findAllByOrderByCreatedAtDesc()
            .stream()
            .map(this::mapToResponse)
            .toList();
}
@Transactional
public OrderResponse updateOrderStatus(
        String orderNumber,
        OrderStatus newStatus
) {
    Order order = orderRepository.findByOrderNumber(orderNumber)
            .orElseThrow(() -> new RuntimeException(
                    "Order not found: " + orderNumber
            ));

    if (order.getStatus() == OrderStatus.DELIVERED ||
            order.getStatus() == OrderStatus.CANCELLED) {
        throw new IllegalStateException(
                "Cannot update a completed or cancelled order."
        );
    }

    order.setStatus(newStatus);

    Order updatedOrder = orderRepository.save(order);

    return mapToResponse(updatedOrder);
}
}
