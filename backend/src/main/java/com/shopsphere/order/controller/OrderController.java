
package com.shopsphere.order.controller;

import com.shopsphere.order.dto.OrderRequest;
import com.shopsphere.order.dto.OrderResponse;
import com.shopsphere.order.entity.OrderStatus;
import com.shopsphere.order.service.OrderService;

import jakarta.validation.Valid;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = "http://localhost:5173")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    // Create a guest order
    @PostMapping
    public ResponseEntity<OrderResponse> createOrder(
            @Valid @RequestBody OrderRequest request) {

        OrderResponse response = orderService.createOrder(request);

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // Retrieve all orders
    @GetMapping
    public ResponseEntity<List<OrderResponse>> getAllOrders() {

        List<OrderResponse> orders = orderService.getAllOrders();

        return ResponseEntity.ok(orders);
    }

    // Retrieve an order by order number
    @GetMapping("/{orderNumber}")
    public ResponseEntity<OrderResponse> getOrder(
            @PathVariable String orderNumber) {

        OrderResponse response =
                orderService.getOrderByNumber(orderNumber);

        return ResponseEntity.ok(response);
    }

    // Update order status
    @PutMapping("/{orderNumber}/status")
    public ResponseEntity<OrderResponse> updateOrderStatus(
            @PathVariable String orderNumber,
            @RequestParam OrderStatus status) {

        OrderResponse response =
                orderService.updateOrderStatus(orderNumber, status);

        return ResponseEntity.ok(response);
    }
}
