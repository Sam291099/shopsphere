
package com.shopsphere.cart.repository;

import com.shopsphere.cart.entity.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CartItemRepository
        extends JpaRepository<CartItem, Long> {

    Optional<CartItem> findByCart_IdAndProduct_Id(
            Long cartId,
            Long productId
    );

    void deleteByCart_IdAndProduct_Id(
            Long cartId,
            Long productId
    );
}
