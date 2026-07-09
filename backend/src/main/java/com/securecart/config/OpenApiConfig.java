package com.securecart.config;

import org.springframework.context.annotation.Configuration;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.enums.SecuritySchemeIn;
import io.swagger.v3.oas.annotations.enums.SecuritySchemeType;
import io.swagger.v3.oas.annotations.info.Contact;
import io.swagger.v3.oas.annotations.info.Info;
import io.swagger.v3.oas.annotations.security.SecurityScheme;

@Configuration
@OpenAPIDefinition(
        info = @Info(
                title = "SecureCart API",
                version = "1.0",
                description = "Production-style e-commerce backend with JWT authentication, "
                + "product catalog, cart management, and order processing.",
                contact = @Contact(
                        name = "SecureCart",
                        email = "dev@securecart.com"
                )
        )
)
@SecurityScheme(
        name = "bearerAuth",
        description = "JWT Bearer token. Login via /api/auth/login to get your token.",
        scheme = "bearer",
        type = SecuritySchemeType.HTTP,
        bearerFormat = "JWT",
        in = SecuritySchemeIn.HEADER
)
public class OpenApiConfig {
}
