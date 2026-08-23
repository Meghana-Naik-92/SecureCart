package com.securecart.util;

public class CategoryMapper {

    private CategoryMapper() {
        // Utility class
    }

    public static String mapCategory(String dummyCategory) {
        if (dummyCategory == null) {
            return "Other";
        }

        String lower = dummyCategory.toLowerCase();

        if (lower.contains("smartphone") || lower.contains("laptop") 
                || lower.contains("electronics") || lower.contains("lighting")) {
            return "Electronics";
        }
        
        if (lower.contains("fragrance") || lower.contains("skincare") 
                || lower.contains("beauty")) {
            return "Beauty";
        }
        
        if (lower.contains("groceries") || lower.contains("food")) {
            return "Groceries";
        }
        
        if (lower.contains("furniture") || lower.contains("home-decoration")) {
            return "Furniture";
        }
        
        if (lower.contains("home")) {
            return "Home";
        }
        
        if (lower.contains("sports") || lower.contains("fitness") || lower.contains("motorcycle") || lower.contains("automotive")) {
            return "Sports";
        }
        
        if (lower.contains("womens") || lower.contains("mens") || lower.contains("tops") 
                || lower.contains("shirt") || lower.contains("shoe") || lower.contains("dress") 
                || lower.contains("jewel") || lower.contains("watch") || lower.contains("bag") 
                || lower.contains("sunglasses") || lower.contains("fashion")) {
            return "Fashion";
        }
        
        return "Other";
    }
}
