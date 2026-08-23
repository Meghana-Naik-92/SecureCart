package com.securecart.component;

import java.math.BigDecimal;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import com.securecart.dto.DummyJsonProduct;
import com.securecart.dto.DummyJsonResponse;
import com.securecart.entity.Product;
import com.securecart.repository.ProductRepository;
import com.securecart.util.CategoryMapper;

@Component
public class DataSeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataSeeder.class);
    
    private final ProductRepository productRepository;
    private final RestClient restClient;

    public DataSeeder(ProductRepository productRepository) {
        this.productRepository = productRepository;
        this.restClient = RestClient.builder().build();
    }

    @Override
    public void run(String... args) throws Exception {
        log.info("Checking existing products...");
        
        if (productRepository.count() > 0) {
            log.info("Product catalog already exists. Skipping import.");
            return;
        }

        log.info("Products table is empty. Fetching products from DummyJSON...");
        
        try {
            DummyJsonResponse response = restClient.get()
                    .uri("https://dummyjson.com/products?limit=100")
                    .retrieve()
                    .body(DummyJsonResponse.class);

            if (response != null && response.getProducts() != null) {
                List<DummyJsonProduct> dummyProducts = response.getProducts();
                
                for (DummyJsonProduct dp : dummyProducts) {
                    Product product = new Product();
                    product.setName(dp.getTitle());
                    product.setDescription(dp.getDescription());
                    product.setPrice(dp.getPrice() != null ? dp.getPrice() : BigDecimal.ZERO);
                    product.setDiscount(dp.getDiscountPercentage() != null ? dp.getDiscountPercentage() : BigDecimal.ZERO);
                    product.setRating(dp.getRating() != null ? dp.getRating() : 0.0);
                    product.setStock(dp.getStock() != null ? dp.getStock() : 10);
                    product.setCategory(CategoryMapper.mapCategory(dp.getCategory()));
                    product.setImageUrl(dp.getThumbnail());
                    
                    productRepository.save(product);
                }
                
                log.info("Successfully imported {} products.", dummyProducts.size());
            } else {
                log.warn("Received empty response from DummyJSON.");
            }
        } catch (Exception e) {
            log.error("Failed to seed products from DummyJSON. Starting application anyway. Error: {}", e.getMessage());
        }
    }
}
