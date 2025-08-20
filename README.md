# E-commerce Backend API

A comprehensive Express.js backend API for an e-commerce application with user authentication, product management with Base64 images, and shopping cart functionality.

## Features

- **User Authentication & Authorization**
  - User registration and login
  - JWT token-based authentication
  - Password reset functionality
  - Role-based access control (User/Admin)

- **Product Management**
  - CRUD operations for products
  - Base64 image storage in database
  - Product inventory tracking
  - Simplified product structure (name, description, quantity, price, total price)

- **Shopping Cart**
  - Add/remove products from cart
  - Update product quantities in cart
  - Cart persistence for logged-in users
  - Multiple products per cart
  - Automatic total price calculation

## Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL with Sequelize ORM
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: Express Validator
- **Security**: Helmet, CORS, Rate Limiting
- **Password Hashing**: bcryptjs
- **Containerization**: Docker & Docker Compose

## Getting Started

### Prerequisites

- Docker and Docker Compose
- Node.js (v18 or higher) 
- npm or yarn package manager

### Installation & Setup

1. Clone the repository
```bash
git clone https://github.com/NonthananSirikanon/ecommerce-backend.git
cd ecommerce-backend
```

2. Start with Docker Compose
```bash
docker-compose -f docker-compose.dev.yml up -d
```

This will start:
- PostgreSQL database on port `5432`
- Backend API on port `3001` 
- Adminer (database admin) on port `8080`

3. The server will be available at `http://localhost:3001`

### Database Connection
- **Host**: `localhost`
- **Port**: `5432`
- **Database**: `ecommerce_db`
- **Username**: `ecommerce_user`
- **Password**: `ecommerce_password`

## API Endpoints

### Authentication

#### Register User
```bash
POST /api/auth/register
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "message": "User registered successfully",
  "token": "jwt_token_here",
  "refreshToken": "refresh_token_here",
  "user": {
    "id": "uuid",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "role": "user",
    "isVerified": false
  }
}
```

#### Login User
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "token": "jwt_token_here",
  "refreshToken": "refresh_token_here",
  "user": {
    "id": "uuid",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "role": "user",
    "isVerified": false
  }
}
```

### Products (Simplified API)

#### Get All Products (with Pagination)
```bash
GET /api/simple-products
GET /api/simple-products?page=1&limit=100&search=product
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Number of products per page (default: 50, max: 1000)
- `search` (optional): Search in product name and description

**Response:**
```json
{
  "success": true,
  "products": [
    {
      "id": "product_uuid",
      "name": "Sample Product",
      "description": "This is a sample product for testing",
      "price": 29.99,
      "image": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD...",
      "quantity": 100,
      "totalPrice": 29.99
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalProducts": 250,
    "productsPerPage": 50,
    "hasNextPage": true,
    "hasPrevPage": false
  },
  "count": 1
}
```

#### Get Single Product
```bash
GET /api/simple-products/:id
```

**Response:**
```json
{
  "success": true,
  "product": {
    "id": "product_uuid",
    "name": "Sample Product",
    "description": "This is a sample product for testing",
    "price": 29.99,
    "image": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD...",
    "quantity": 100,
    "totalPrice": 29.99
  }
}
```

#### Create Product (Admin Only)
```bash
POST /api/simple-products
Authorization: Bearer jwt_token_here
Content-Type: application/json

{
  "name": "New Product",
  "description": "Product description here",
  "price": 49.99,
  "quantity": 50,
  "image": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD..."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Product created successfully",
  "product": {
    "id": "new_product_uuid",
    "name": "New Product",
    "description": "Product description here",
    "price": 49.99,
    "image": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD...",
    "quantity": 50,
    "totalPrice": 49.99
  }
}
```

#### Update Product (Admin Only)
```bash
PUT /api/simple-products/:id
Authorization: Bearer jwt_token_here
Content-Type: application/json

{
  "name": "Updated Product Name",
  "price": 59.99,
  "quantity": 75
}
```

#### Delete Product (Admin Only)
```bash
DELETE /api/simple-products/:id
Authorization: Bearer jwt_token_here
```

**Response:**
```json
{
  "success": true,
  "message": "Product deleted successfully"
}
```

### Shopping Cart (Simplified API)

#### Get User Cart
```bash
GET /api/simple-cart
Authorization: Bearer jwt_token_here
```

**Response:**
```json
{
  "success": true,
  "cart": {
    "id": "cart_uuid",
    "userId": "user_uuid",
    "items": [
      {
        "id": "cart_item_uuid",
        "productId": "product_uuid",
        "productName": "Sample Product",
        "productDescription": "This is a sample product for testing",
        "productImage": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD...",
        "price": 29.99,
        "quantity": 2,
        "totalPrice": 59.98,
        "variant": null
      }
    ],
    "totalAmount": 59.98,
    "itemCount": 1
  }
}
```

#### Add Product to Cart
```bash
POST /api/simple-cart/add
Authorization: Bearer jwt_token_here
Content-Type: application/json

{
  "productId": "product_uuid",
  "quantity": 2,
  "variant": "red" // optional
}
```

**Response:**
```json
{
  "success": true,
  "message": "Product added to cart successfully",
  "item": {
    "id": "cart_item_uuid",
    "productId": "product_uuid",
    "productName": "Sample Product",
    "productDescription": "This is a sample product for testing",
    "productImage": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD...",
    "price": 29.99,
    "quantity": 2,
    "totalPrice": 59.98,
    "variant": "red"
  },
  "cartTotal": 59.98
}
```

#### Update Cart Item Quantity
```bash
PUT /api/simple-cart/items/:itemId
Authorization: Bearer jwt_token_here
Content-Type: application/json

{
  "quantity": 3
}
```

**Response:**
```json
{
  "success": true,
  "message": "Cart item updated successfully",
  "item": {
    "id": "cart_item_uuid",
    "productId": "product_uuid",
    "productName": "Sample Product",
    "productDescription": "This is a sample product for testing",
    "productImage": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD...",
    "price": 29.99,
    "quantity": 3,
    "totalPrice": 89.97,
    "variant": "red"
  },
  "cartTotal": 89.97
}
```

#### Remove Item from Cart
```bash
DELETE /api/simple-cart/items/:itemId
Authorization: Bearer jwt_token_here
```

**Response:**
```json
{
  "success": true,
  "message": "Item removed from cart successfully",
  "cartTotal": 0
}
```

#### Clear Entire Cart
```bash
DELETE /api/simple-cart/clear
Authorization: Bearer jwt_token_here
```

**Response:**
```json
{
  "success": true,
  "message": "Cart cleared successfully"
}
```

## Database Schema

### Products Table
- `id` (UUID, Primary Key)
- `name` (String, Required) - Product name
- `description` (Text, Required) - Product description  
- `price` (Decimal, Required) - Product price
- `image` (Text, Optional) - Base64 encoded image
- `inventory` (JSONB) - Contains quantity and tracking info
- `categoryId` (UUID, Foreign Key)
- `isActive` (Boolean, Default: true)

### Carts Table
- `id` (UUID, Primary Key)
- `userId` (UUID, Foreign Key to users table)
- `totalAmount` (Decimal) - Auto-calculated total

### CartItems Table  
- `id` (UUID, Primary Key)
- `cartId` (UUID, Foreign Key to carts table)
- `productId` (UUID, Foreign Key to products table)
- `quantity` (Integer, Required) - Number of items
- `price` (Decimal, Required) - Price per item
- `variant` (String, Optional) - Product variant
- `totalPrice` (Virtual Field) - Calculated as price × quantity

### Users Table
- `id` (UUID, Primary Key)
- `firstName` (String, Required)
- `lastName` (String, Required)
- `email` (String, Required, Unique)
- `password` (String, Required, Hashed)
- `role` (Enum: 'user', 'admin')
- `isVerified` (Boolean)

## Example Usage

### Complete Workflow Example

1. **Register a new user:**
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"firstName": "John", "lastName": "Doe", "email": "john@example.com", "password": "password123"}'
```

2. **Login to get token:**
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "john@example.com", "password": "password123"}'
```

3. **Create a product (as admin):**
```bash
curl -X POST http://localhost:3001/api/simple-products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "name": "Test Product",
    "description": "A test product",
    "price": 19.99,
    "quantity": 100,
    "image": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD..."
  }'
```

4. **Add product to cart:**
```bash
curl -X POST http://localhost:3001/api/simple-cart/add \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"productId": "PRODUCT_UUID", "quantity": 2}'
```

5. **Get cart contents:**
```bash
curl -X GET http://localhost:3001/api/simple-cart \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

6. **Get products with pagination:**
```bash
# Get first 100 products
curl -X GET "http://localhost:3001/api/simple-products?limit=100"

# Get page 2 with 50 products per page
curl -X GET "http://localhost:3001/api/simple-products?page=2&limit=50"

# Search for products
curl -X GET "http://localhost:3001/api/simple-products?search=test&limit=20"
```

## Error Responses

All endpoints return standardized error responses:

```json
{
  "success": false,
  "message": "Error description",
  "errors": [
    {
      "msg": "Detailed error message",
      "param": "field_name",
      "location": "body"
    }
  ]
}
```

## Security Features

- JWT token-based authentication
- Password hashing with bcrypt
- Rate limiting to prevent abuse
- CORS configuration
- Helmet for security headers
- Input validation and sanitization
- Admin role authorization for product management

## Development

### Running Locally
```bash
# Start database and services
docker-compose -f docker-compose.dev.yml up -d

# Stop services
docker-compose -f docker-compose.dev.yml down

# View logs
docker logs ecommerce-backend-app-1
```

### Database Management
- **Adminer**: http://localhost:8080 (Web-based database admin)
- **Direct Connection**: Use the connection details above with any PostgreSQL client

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the ISC License.