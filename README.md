# 🛒 SecureCart - Full-Stack E-Commerce Platform

SecureCart is a robust, full-stack e-commerce application built with Spring Boot (Java) on the backend and React (Vite) on the frontend. It features a complete user journey from registration and authentication to product browsing, shopping cart management, and a mock checkout flow.

## 🚀 Final Project Report & Features Achieved

Throughout the development lifecycle, we focused on building a secure, scalable, and responsive application. Here is a summary of all features implemented from the start:

### 1. Robust Backend Architecture & Security
- **Technology:** Spring Boot, Spring Security, Hibernate/JPA, MySQL, JWT.
- **Achievement:** We built a secure REST API with layered architecture (Controllers, Services, Repositories). Implemented a `JwtAuthFilter` to secure endpoints statelessly. Passwords are encrypted using BCrypt, and API endpoints are strictly protected by role-based access control.

### 2. User Authentication & Authorization
- **Technology:** React, Context API, Axios Interceptors, JWT.
- **Achievement:** Created a complete registration and login flow. The frontend `AuthContext` securely manages the JWT token, automatically attaching it to protected API requests and handling session expiration seamlessly.

### 3. Dynamic Product Catalog & Seeder
- **Technology:** Spring Boot, External DummyJSON API, React, CSS.
- **Achievement:** Built an automated `DataSeeder` that seeds the MySQL database with realistic products upon startup. On the frontend, implemented a responsive product grid, individual product detail pages, and functional category/price filtering and searching.

### 4. Pagination & State Management
- **Technology:** Spring Data JPA `Pageable`, React `useState` & `useEffect`.
- **Achievement:** Implemented backend pagination to prevent massive data payloads. The frontend smoothly handles numbered pagination (1, 2, 3...) to fetch and render products dynamically without reloading the page.

### 5. Secure Shopping Cart
- **Technology:** Spring Boot `@Transactional` Services, React UI.
- **Achievement:** Users can add items, update quantities, and remove items. The backend actively verifies stock levels in real-time, preventing users from adding out-of-stock items, and ties the cart exclusively to the authenticated user.

### 6. Mock Checkout & Order Management
- **Technology:** React Form Handling, Spring Boot Order Entities.
- **Achievement:** A complete mock checkout flow captures shipping details and simulates payment processing. Upon successful checkout, the backend creates an `Order`, generates `OrderItems` tied to current prices, deducts inventory stock, and clears the user's cart. Users can view their past orders on a dedicated "My Orders" page.

---

## 🛠️ Technology Stack

### Backend
- **Framework:** Spring Boot 3
- **Language:** Java 17+
- **Database:** MySQL
- **ORM:** Hibernate / Spring Data JPA
- **Security:** Spring Security & JWT (JSON Web Tokens)
- **Documentation:** Swagger UI / OpenAPI

### Frontend
- **Framework:** React 19 (via Vite)
- **Routing:** React Router DOM
- **HTTP Client:** Axios
- **Styling:** Vanilla CSS with custom design system variables
- **State Management:** React Context API & Hooks

---

## 📖 User Manual: How to Run the Project

Follow these instructions to run the SecureCart application on your local machine.

### Prerequisites
1. **Java Development Kit (JDK):** Version 17 or higher.
2. **Node.js:** Version 18 or higher.
3. **MySQL Server:** Running locally.

### 1. Database Setup
Ensure you have a MySQL server running locally. Create a database named `securecart`.
You do not need to create tables manually; Hibernate will auto-generate them.

Update your database credentials if necessary in the backend configuration file:
`backend/src/main/resources/application.properties`
```properties
spring.datasource.username=root
spring.datasource.password=YourPasswordHere
```

### 2. Running the Backend
1. Open a terminal and navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Run the application using the Maven Wrapper:
   ```bash
   # On Windows
   .\mvnw.cmd spring-boot:run
   
   # On Mac/Linux
   ./mvnw spring-boot:run
   ```
3. The backend will start on `http://localhost:8081`. 
   *(Note: On the very first run, it will automatically seed the database with products!)*

### 3. Running the Frontend
1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install the necessary dependencies (only needed the first time):
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
4. The frontend will start on `http://localhost:5173`.

### 4. Experiencing the Demo
- Open your browser and go to **[http://localhost:5173](http://localhost:5173)**.
- **Register:** Create a new account and log in.
- **Browse:** Look through the paginated product catalog and try the search/filter functions.
- **Shop:** Click on a product to view details, then add it to your cart.
- **Checkout:** Navigate to your cart, click "Proceed to Checkout", fill out the mock payment form, and place your order.
- **Verify:** View your successfully placed order in the "My Orders" section.
