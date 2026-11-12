
package com.shopsphere.cart.dto;

public record CartItemRequest(
        Long productId,
        Integer quantity
) {
}
