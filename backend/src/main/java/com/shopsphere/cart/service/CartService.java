
package com.shopsphere.cart.service;

import com.shopsphere.cart.dto.CartItemRequest;
import com.shopsphere.cart.dto.CartResponse;
import com.shopsphere.cart.entity.Cart;
import com.shopsphere.cart.entity.CartItem;
import com.shopsphere.cart.repository.CartRepository;
import com.shopsphere.product.entity.Product;
import com.shopsphere.product.repository.ProductRepository;
import com.shopsphere.user.entity.User;
import com.shopsphere.user.repository.UserRepository;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.List;

@Service
public class CartService {

    private final CartRepository cartRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    public CartService(
            CartRepository cartRepository,
            ProductRepository productRepository,
            UserRepository userRepository
    ) {
        this.cartRepository = cartRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public CartResponse getCart(String email) {
        Cart cart = cartRepository.findByUser_Id(
                getUser(email).getId()
        ).orElse(null);

        if (cart == null) {
            return new CartResponse(
                    null,
                    List.of(),
                    BigDecimal.ZERO
            );
        }

        return buildCartResponse(cart);
    }

    @Transactional
    public CartResponse addItem(
            String email,
            CartItemRequest request
    ) {
        validateRequest(request);

        Cart cart = getOrCreateCart(email);

        Product product = getProduct(request.productId());

        validateProduct(product);

        CartItem existingItem = cart.getItems()
                .stream()
                .filter(item ->
                        item.getProduct().getId().equals(product.getId())
                )
                .findFirst()
                .orElse(null);

        int currentQuantity = existingItem == null
                ? 0
                : existingItem.getQuantity();

        int newQuantity = currentQuantity + request.quantity();

        validateStock(product, newQuantity);

        if (existingItem == null) {
            CartItem newItem = new CartItem();
            newItem.setProduct(product);
            newItem.setQuantity(request.quantity());
            cart.addItem(newItem);
        } else {
            existingItem.setQuantity(newQuantity);
        }

        Cart savedCart = cartRepository.save(cart);

        return buildCartResponse(savedCart);
    }

    @Transactional
    public CartResponse updateItemQuantity(
            String email,
            Long productId,
            Integer quantity
    ) {
        if (quantity == null || quantity <= 0) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Quantity must be greater than zero."
            );
        }

        Cart cart = getExistingCart(email);

        CartItem item = findCartItem(cart, productId);

        Product product = item.getProduct();

        validateProduct(product);
        validateStock(product, quantity);

        item.setQuantity(quantity);

        Cart savedCart = cartRepository.save(cart);

        return buildCartResponse(savedCart);
    }

    @Transactional
    public CartResponse removeItem(
            String email,
            Long productId
    ) {
        Cart cart = getExistingCart(email);

        CartItem item = findCartItem(cart, productId);

        cart.removeItem(item);

        Cart savedCart = cartRepository.save(cart);

        return buildCartResponse(savedCart);
    }

    @Transactional
    public void clearCart(String email) {
        Cart cart = getExistingCart(email);

        cart.getItems().clear();

        cartRepository.save(cart);
    }

    private User getUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Customer not found."
                        )
                );
    }

    private Cart getOrCreateCart(String email) {
        User user = getUser(email);

        return cartRepository.findByUser_Id(user.getId())
                .orElseGet(() -> {
                    Cart cart = new Cart();
                    cart.setUser(user);
                    return cartRepository.save(cart);
                });
    }

    private Cart getExistingCart(String email) {
        User user = getUser(email);

        return cartRepository.findByUser_Id(user.getId())
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Cart not found."
                        )
                );
    }

    private Product getProduct(Long productId) {
        return productRepository.findById(productId)
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Product not found."
                        )
                );
    }

    private CartItem findCartItem(
            Cart cart,
            Long productId
    ) {
        return cart.getItems()
                .stream()
                .filter(item ->
                        item.getProduct().getId().equals(productId)
                )
                .findFirst()
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Product not found in your cart."
                        )
                );
    }

    private void validateRequest(CartItemRequest request) {
        if (request == null ||
                request.productId() == null ||
                request.quantity() == null ||
                request.quantity() <= 0) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Valid product ID and positive quantity are required."
            );
        }
    }

    private void validateProduct(Product product) {
        if (!Boolean.TRUE.equals(product.getActive())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "This product is currently unavailable."
            );
        }

        if (product.getStockQuantity() == null ||
                product.getStockQuantity() <= 0) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "This product is out of stock."
            );
        }
    }

    private void validateStock(Product product, int quantity) {
        if (quantity > product.getStockQuantity()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Requested quantity exceeds available stock."
            );
        }
    }

    private CartResponse buildCartResponse(Cart cart) {
        List<CartResponse.CartItemResponse> items =
                cart.getItems().stream()
                        .map(item -> {
                            Product product = item.getProduct();

                            BigDecimal lineTotal =
                                    product.getPrice().multiply(
                                            BigDecimal.valueOf(
                                                    item.getQuantity()
                                            )
                                    );

                            return new CartResponse.CartItemResponse(
                                    product.getId(),
                                    product.getName(),
                                    product.getSku(),
                                    product.getPrice(),
                                    product.getStockQuantity(),
                                    item.getQuantity(),
                                    lineTotal
                            );
                        })
                        .toList();

        BigDecimal subtotal = items.stream()
                .map(CartResponse.CartItemResponse::lineTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return new CartResponse(
                cart.getId(),
                items,
                subtotal
        );
    }
}
