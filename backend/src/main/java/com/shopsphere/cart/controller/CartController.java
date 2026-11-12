
package com.shopsphere.cart.controller;

import com.shopsphere.cart.dto.CartItemRequest;
import com.shopsphere.cart.dto.CartResponse;
import com.shopsphere.cart.service.CartService;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cart")
public class CartController {

    private final CartService cartService;

    public CartController(CartService cartService) {
        this.cartService = cartService;
    }

    @GetMapping
    public ResponseEntity<CartResponse> getCart(
            Authentication authentication
    ) {
        return ResponseEntity.ok(
                cartService.getCart(authentication.getName())
        );
    }

    @PostMapping("/items")
    public ResponseEntity<CartResponse> addItem(
            Authentication authentication,
            @Valid @RequestBody CartItemRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(
                cartService.addItem(
                        authentication.getName(),
                        request
                )
        );
    }

    @PutMapping("/items/{productId}")
    public ResponseEntity<CartResponse> updateItemQuantity(
            Authentication authentication,
            @PathVariable Long productId,
            @RequestParam Integer quantity
    ) {
        return ResponseEntity.ok(
                cartService.updateItemQuantity(
                        authentication.getName(),
                        productId,
                        quantity
                )
        );
    }

    @DeleteMapping("/items/{productId}")
    public ResponseEntity<CartResponse> removeItem(
            Authentication authentication,
            @PathVariable Long productId
    ) {
        return ResponseEntity.ok(
                cartService.removeItem(
                        authentication.getName(),
                        productId
                )
        );
    }

    @DeleteMapping
    public ResponseEntity<Void> clearCart(
            Authentication authentication
    ) {
        cartService.clearCart(authentication.getName());
        return ResponseEntity.noContent().build();
    }
}
