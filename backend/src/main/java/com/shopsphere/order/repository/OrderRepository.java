
package com.shopsphere.order.repository;

import com.shopsphere.order.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import com.shopsphere.order.entity.OrderStatus;

import java.util.List;
import java.util.Optional;

public interface OrderRepository extends JpaRepository<Order, Long> {

    Optional<Order> findByOrderNumber(String orderNumber);

    boolean existsByOrderNumber(String orderNumber);

    List<Order> findAllByOrderByCreatedAtDesc();
    List<Order> findByStatusOrderByCreatedAtDesc(OrderStatus status);
}
