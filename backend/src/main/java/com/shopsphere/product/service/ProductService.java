
package com.shopsphere.product.service;

import com.shopsphere.product.dto.ProductRequest;
import com.shopsphere.product.dto.ProductResponse;
import com.shopsphere.product.entity.Product;
import com.shopsphere.product.repository.ProductRepository;
import com.shopsphere.exception.ProductNotFoundException;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class ProductService {

    private final ProductRepository productRepository;

    public ProductService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    public ProductResponse createProduct(ProductRequest request) {

        if (productRepository.existsBySku(request.sku())) {
            throw new IllegalArgumentException(
                "Product SKU already exists: " + request.sku()
            );
        }

        Product product = new Product();
        mapRequest(product, request);

        return mapResponse(productRepository.save(product));
    }

    @Transactional(readOnly = true)
    public List<ProductResponse> getAllProducts() {

        return productRepository.findAll()
                .stream()
                .map(this::mapResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public ProductResponse getProductById(Long id) {

        Product product = productRepository.findById(id)
                .orElseThrow(() ->
                    new ProductNotFoundException(id)
                );

        return mapResponse(product);
    }

    public ProductResponse updateProduct(
            Long id, ProductRequest request) {

        Product product = productRepository.findById(id)
                .orElseThrow(() ->
                    new ProductNotFoundException(id)
                );

        if (!product.getSku().equals(request.sku())
                && productRepository.existsBySku(request.sku())) {
            throw new IllegalArgumentException(
                "Product SKU already exists: " + request.sku()
            );
        }

        mapRequest(product, request);

        return mapResponse(productRepository.save(product));
    }

    public void deleteProduct(Long id) {

        Product product = productRepository.findById(id)
                .orElseThrow(() ->
                    new ProductNotFoundException(id)
                );

        productRepository.delete(product);
    }

    private void mapRequest(
            Product product, ProductRequest request) {

        product.setName(request.name());
        product.setSku(request.sku());
        product.setDescription(request.description());
        product.setPrice(request.price());
        product.setStockQuantity(request.stockQuantity());
    }

    private ProductResponse mapResponse(Product product) {

        return new ProductResponse(
            product.getId(),
            product.getName(),
            product.getSku(),
            product.getDescription(),
            product.getPrice(),
            product.getStockQuantity(),
            product.getActive(),
            product.getCreatedAt(),
            product.getUpdatedAt()
        );
    }
}
