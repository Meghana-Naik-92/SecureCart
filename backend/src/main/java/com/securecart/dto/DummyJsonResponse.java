package com.securecart.dto;

import java.util.List;

public class DummyJsonResponse {
    private List<DummyJsonProduct> products;

    public List<DummyJsonProduct> getProducts() {
        return products;
    }

    public void setProducts(List<DummyJsonProduct> products) {
        this.products = products;
    }
}
