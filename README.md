# E-commerce Backend API

A comprehensive Express.js backend API for an e-commerce application with user authentication, product management, shopping cart, payment processing, and order management.

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

- **Order Management**
  - Simple order creation for users
  - Order status tracking
  - User-specific order management
  - Fallback order system (no cart dependency)

- **Payment Processing**
  - Payment creation and tracking
  - Multiple payment methods support
  - Payment status management
  - Transaction tracking
  - Order-payment linking

- **Shipping Addresses**
  - CRUD operations for shipping addresses
  - Default address management
  - Multiple address types (home, work, other)
  - Address validation and formatting

- **Order History**
  - Complete order tracking with payment status
  - Order lifecycle management (pending to delivered)
  - Payment status tracking (paid/unpaid orders)
  - Automatic status history logging
  - Order filtering and pagination
  - Order statistics and summaries

- **Admin Dashboard Analytics**
  - Real-time sales and revenue analytics
  - Order status distribution tracking
  - Payment status monitoring
  - Top-selling products and categories
  - User growth analytics
  - Inventory alerts for low stock
  - Comprehensive business insights

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

### Health Check

#### Server Health Check
```bash
GET /api/health
```
**Response:**
```json
{
  "status": "OK",
  "message": "Server is running"
}
```

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

#### Refresh Token
```bash
POST /api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "refresh_token_here"
}
```

#### Forgot Password
```bash
POST /api/auth/forgot-password
Content-Type: application/json

{
  "email": "john@example.com"
}
```

#### Reset Password
```bash
POST /api/auth/reset-password/:token
Content-Type: application/json

{
  "password": "newpassword123"
}
```

### User Management

#### Get User Profile
```bash
GET /api/users/profile
Authorization: Bearer jwt_token_here
```

#### Update User Profile
```bash
PUT /api/users/profile
Authorization: Bearer jwt_token_here
Content-Type: application/json

{
  "firstName": "Updated Name",
  "lastName": "Updated Last",
  "phone": "+1234567890",
  "email": "updated@example.com"
}
```

#### Change Password
```bash
PUT /api/users/change-password
Authorization: Bearer jwt_token_here
Content-Type: application/json

{
  "currentPassword": "oldpassword123",
  "newPassword": "newpassword123"
}
```

#### Get All Users (Admin Only)
```bash
GET /api/users
Authorization: Bearer admin_jwt_token_here
```

### Products

#### Get All Products (Public)
```bash
GET /api/products?page=1&limit=12&categoryId=uuid&search=keyword&sort=price
```

**Query Parameters:**
- `page` (optional): Page number
- `limit` (optional): Items per page (max 100)
- `categoryId` (optional): Filter by category
- `search` (optional): Search in name/description
- `minPrice`, `maxPrice` (optional): Price range filter
- `brand` (optional): Filter by brand
- `tags` (optional): Filter by tags (comma-separated)
- `sort` (optional): Sort by price, name, createdAt, averageRating

#### Get Single Product
```bash
GET /api/products/:id
```

#### Get Product Categories
```bash
GET /api/products/categories/list
```

### Cart Management

#### Get User Cart
```bash
GET /api/cart
Authorization: Bearer jwt_token_here
```

#### Add Product to Cart
```bash
POST /api/cart/items
Authorization: Bearer jwt_token_here
Content-Type: application/json

{
  "productId": "product-uuid",
  "quantity": 2
}
```

#### Update Cart Item
```bash
PUT /api/cart/items/:productId
Authorization: Bearer jwt_token_here
Content-Type: application/json

{
  "quantity": 3
}
```

#### Remove Item from Cart
```bash
DELETE /api/cart/items/:productId
Authorization: Bearer jwt_token_here
```

#### Clear Cart
```bash
DELETE /api/cart
Authorization: Bearer jwt_token_here
```

### Shipping Addresses

#### Get User Shipping Addresses
```bash
GET /api/shipping-addresses
Authorization: Bearer jwt_token_here
```

#### Create Shipping Address
```bash
POST /api/shipping-addresses
Authorization: Bearer jwt_token_here
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "company": "Company Name",
  "address": "123 Main Street",
  "apartment": "Apt 4B",
  "city": "Bangkok",
  "province": "Bangkok",
  "postalCode": "10110",
  "country": "Thailand",
  "phone": "+66123456789",
  "addressType": "home",
  "isDefault": true
}
```

#### Update Shipping Address
```bash
PUT /api/shipping-addresses/:id
Authorization: Bearer jwt_token_here
Content-Type: application/json

{
  "address": "456 Updated Street",
  "isDefault": false
}
```

#### Delete Shipping Address
```bash
DELETE /api/shipping-addresses/:id
Authorization: Bearer jwt_token_here
```

#### Set Default Address
```bash
PATCH /api/shipping-addresses/:id/default
Authorization: Bearer jwt_token_here
```

### Simple Products (Alternative API)

#### Get All Simple Products
```bash
GET /api/simple-products?page=1&limit=12
```

#### Get Single Simple Product
```bash
GET /api/simple-products/:id
```

### Simple Cart (Alternative Cart API)

#### Get Simple Cart
```bash
GET /api/simple-cart
Authorization: Bearer jwt_token_here
```

#### Add to Simple Cart
```bash
POST /api/simple-cart/items
Authorization: Bearer jwt_token_here
Content-Type: application/json

{
  "productId": "product-uuid",
  "quantity": 2
}
```

#### Update Simple Cart Item
```bash
PUT /api/simple-cart/items/:productId
Authorization: Bearer jwt_token_here
Content-Type: application/json

{
  "quantity": 3
}
```

#### Remove from Simple Cart
```bash
DELETE /api/simple-cart/items/:productId
Authorization: Bearer jwt_token_here
```

#### Clear Simple Cart
```bash
DELETE /api/simple-cart
Authorization: Bearer jwt_token_here
```

### Order Management (Admin)

#### Get All Orders (Admin Only)
```bash
GET /api/orders?page=1&limit=20&status=pending
Authorization: Bearer admin_jwt_token_here
```

#### Get Single Order (Admin)
```bash
GET /api/orders/:id
Authorization: Bearer admin_jwt_token_here
```

#### Update Order Status (Admin)
```bash
PUT /api/orders/:id/status
Authorization: Bearer admin_jwt_token_here
Content-Type: application/json

{
  "status": "processing"
}
```

#### Delete Order (Admin)
```bash
DELETE /api/orders/:id
Authorization: Bearer admin_jwt_token_here
```

### Order History

#### Get User Order History
```bash
GET /api/order-history?page=1&limit=10&status=completed
Authorization: Bearer jwt_token_here
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10, max: 50)
- `status` (optional): Filter by order status
- `paymentStatus` (optional): Filter by payment status
- `startDate`, `endDate` (optional): Date range filter

#### Get Order Statistics
```bash
GET /api/order-history/stats
Authorization: Bearer jwt_token_here
```

### Simple Orders (User-Friendly)

#### Create Simple Order
```bash
POST /api/simple-orders
Authorization: Bearer jwt_token_here
Content-Type: application/json

{
  "shippingAddress": {
    "firstName": "John",
    "lastName": "Doe",
    "address": "123 Main Street",
    "city": "Bangkok",
    "postalCode": "10110"
  },
  "paymentMethod": "credit_card",
  "totalAmount": 299.99,
  "items": [
    {
      "productId": "product-123",
      "name": "Product Name",
      "quantity": 2,
      "price": 149.99
    }
  ]
}
```

**Field Requirements:**
- `shippingAddress` (required): Object with firstName, lastName, address, city
- `paymentMethod` (required): "credit_card", "debit_card", "bank_transfer", "cash", or "digital_wallet"
- `totalAmount` (optional): Total order amount (decimal)
- `items` (optional): Array of order items

**Response:**
```json
{
  "success": true,
  "message": "Order created successfully",
  "order": {
    "id": "b1568fdb-026f-447b-8e19-beca5df929d7",
    "orderNumber": "ORD-1756052514343",
    "userId": "user_uuid",
    "shippingAddress": {
      "firstName": "John",
      "lastName": "Doe",
      "address": "123 Main Street",
      "city": "Bangkok",
      "postalCode": "10110"
    },
    "paymentMethod": "credit_card",
    "totalPrice": 299.99,
    "status": "pending",
    "items": [
      {
        "productId": "product-123",
        "name": "Product Name",
        "quantity": 2,
        "price": 149.99
      }
    ],
    "createdAt": "2025-08-24T16:21:54.365Z"
  }
}
```

#### Get User Orders
```bash
GET /api/simple-orders
Authorization: Bearer jwt_token_here
```

**Response:**
```json
{
  "success": true,
  "orders": [
    {
      "id": "order_uuid",
      "order_number": "ORD-1756052514343",
      "user_id": "user_uuid",
      "shipping_address": {},
      "payment_info": {},
      "total_price": "299.99",
      "status": "pending",
      "created_at": "2025-08-24T16:21:54.365Z"
    }
  ],
  "count": 1
}
```

#### Get Single Order
```bash
GET /api/simple-orders/:id
Authorization: Bearer jwt_token_here
```

#### Update Order Status
```bash
PUT /api/simple-orders/:id/status
Authorization: Bearer jwt_token_here
Content-Type: application/json

{
  "status": "processing"
}
```

### Payments

#### Create Payment (After Order Creation)
```bash
POST /api/payments
Authorization: Bearer jwt_token_here
Content-Type: application/json

{
  "orderId": "b1568fdb-026f-447b-8e19-beca5df929d7",
  "amount": 299.99,
  "currency": "THB",
  "paymentMethod": "credit_card",
  "transactionId": "txn_123456789",
  "paymentProvider": "stripe",
  "paymentDetails": {
    "cardLast4": "4242",
    "cardBrand": "visa"
  }
}
```

**Field Requirements:**
- `orderId` (required): Valid UUID of existing order (from Simple Orders API)
- `amount` (required): Payment amount (decimal, min 0.01)
- `currency` (optional): 3-character currency code, defaults to "THB"
- `paymentMethod` (required): "credit_card", "debit_card", "bank_transfer", "cash", or "digital_wallet"
- `transactionId` (optional): External transaction ID, max 100 characters
- `paymentProvider` (optional): Payment provider name, max 50 characters
- `paymentDetails` (optional): JSON object with additional payment info

**Response:**
```json
{
  "success": true,
  "message": "Payment created successfully",
  "payment": {
    "id": "payment_uuid",
    "orderId": "b1568fdb-026f-447b-8e19-beca5df929d7",
    "userId": "user_uuid",
    "amount": "299.99",
    "currency": "THB",
    "paymentMethod": "credit_card",
    "paymentStatus": "pending",
    "transactionId": "txn_123456789",
    "paymentProvider": "stripe",
    "paymentDetails": {
      "cardLast4": "4242",
      "cardBrand": "visa"
    },
    "paidAt": null,
    "failureReason": null,
    "createdAt": "2025-08-24T16:22:09.566Z",
    "updatedAt": "2025-08-24T16:22:09.566Z"
  }
}
```

#### Update Payment Status
```bash
PUT /api/payments/:id/status
Authorization: Bearer jwt_token_here
Content-Type: application/json

{
  "paymentStatus": "completed",
  "transactionId": "txn_updated_123456789"
}
```

#### Get All Payments
```bash
GET /api/payments
Authorization: Bearer jwt_token_here
```

#### Get Payments by Status
```bash
GET /api/payments/status/completed
Authorization: Bearer jwt_token_here
```

**Valid Payment Status Values:**
- `pending`
- `processing`  
- `completed`
- `failed`
- `cancelled`
- `refunded`

## 📋 Admin APIs - คู่มือการใช้งานแบบละเอียด

### 👑 Admin Product Management (การจัดการสินค้าสำหรับแอดมิน)
#### 1. ดูสินค้าทั้งหมด (รวมสินค้าที่ไม่ใช้งาน)
```bash
GET /api/products/admin/all?page=1&limit=20&status=all
Authorization: Bearer admin_jwt_token_here
```

**🔧 การใช้งาน:**
```javascript
// ดูสินค้าทั้งหมด
fetch('/api/products/admin/all', {
  headers: { 'Authorization': `Bearer ${adminToken}` }
})

// กรองเฉพาะสินค้าที่ไม่ใช้งาน
fetch('/api/products/admin/all?status=inactive&page=1&limit=50', {
  headers: { 'Authorization': `Bearer ${adminToken}` }
})

// ค้นหาสินค้า
fetch('/api/products/admin/all?search=iPhone&categoryId=category-uuid', {
  headers: { 'Authorization': `Bearer ${adminToken}` }
})
```

**Query Parameters:**
- `page` (optional): หน้าที่ (default: 1)
- `limit` (optional): จำนวนรายการต่อหน้า (default: 20, max: 100)
- `status` (optional): กรองตามสถานะ - "active", "inactive", "all" (default: all)
- `categoryId` (optional): กรองตามหมวดหมู่
- `search` (optional): ค้นหาในชื่อ, รายละเอียด, หรือ SKU
- `sort` (optional): เรียงตาม "name", "-name", "created_at", "-created_at", "price", "-price"

**Response:**
```json
{
  "products": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "iPhone 15 Pro",
      "description": "มือถือรุ่นล่าสุดจาก Apple",
      "price": "45900.00",
      "sku": "IPH15PRO-001",
      "brand": "Apple",
      "inventory": {
        "quantity": 100,
        "trackInventory": true,
        "lowStockThreshold": 10
      },
      "isActive": true,
      "tags": ["smartphone", "apple", "premium"],
      "category": {
        "name": "Electronics",
        "slug": "electronics"
      },
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-20T14:25:00.000Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalProducts": 87,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

#### 2. สร้างสินค้าใหม่ (แบบง่าย)
```bash
POST /api/products
Authorization: Bearer admin_jwt_token_here
Content-Type: application/json

{
  "image": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD...",
  "name": "iPhone 15 Pro",
  "description": "มือถือรุ่นล่าสุดจาก Apple พร้อมกล้อง 48MP และชิป A17 Pro",
  "price": 45900,
  "inventory": {
    "quantity": 50
  }
}
```

**🔧 การใช้งานแบบง่าย (แค่ 5 ฟิลด์หลัก):**
```javascript
const createSimpleProduct = async (imageFile, productName, description, price, quantity) => {
  // แปลงรูปภาพเป็น base64
  const base64Image = await convertToBase64(imageFile);
  
  const response = await fetch('/api/products', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${adminToken}`
    },
    body: JSON.stringify({
      image: base64Image,
      name: productName,
      description: description,
      price: price,
      inventory: { quantity: quantity }
      // category, SKU, brand จะถูกกำหนดอัตโนมัติ
    })
  });
  
  const result = await response.json();
  console.log('เพิ่มสินค้าสำเร็จ:', result.product.name);
  return result.product;
};

// ตัวอย่างการเรียกใช้งาน
const addProduct = async () => {
  try {
    const product = await createSimpleProduct(
      document.getElementById('productImage').files[0], // รูปสินค้า
      "เสื้อยืดคอตตอน",                               // ชื่อสินค้า
      "เสื้อยืดผ้าคอตตอน 100% นุ่มสบาย",              // รายละเอียด
      590,                                           // ราคา
      100                                            // จำนวน
    );
    
    alert(`เพิ่มสินค้า ${product.name} สำเร็จ!`);
  } catch (error) {
    alert('เกิดข้อผิดพลาด: ' + error.message);
  }
};

// Function แปลงไฟล์เป็น base64
const convertToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
};
```

**🎯 ข้อมูลที่ต้องการ (แค่ 5 ฟิลด์หลัก):**

### **✅ ข้อมูลที่ต้องใส่:**
1. **`image`** - รูปสินค้า (base64 string)
2. **`name`** - ชื่อสินค้า
3. **`description`** - รายละเอียดสินค้า
4. **`price`** - ราคาสินค้า (ตัวเลข)
5. **`inventory.quantity`** - จำนวนสินค้า (ตัวเลข)

### **🔧 ข้อมูลที่ระบบสร้างให้อัตโนมัติ:**
- **Product ID** - UUID สำหรับสินค้า
- **SKU** - รหัสสินค้า (จากชื่อ + timestamp)
- **Category** - หมวดหมู่ "General" (ถ้าไม่ระบุ)
- **Timestamps** - วันที่สร้าง/แก้ไข

### **📋 ตัวอย่างการใช้งานแบบง่าย:**
```json
{
  "image": "data:image/jpeg;base64,/9j/4AAQSkZJRgABA...",
  "name": "เสื้อโปโลผู้ชาย",
  "description": "เสื้อโปโลผ้าคอตตอน สีน้ำเงิน ใส่สบาย",
  "price": 890,
  "inventory": {
    "quantity": 150
  }
}
```

**Response:**
```json
{
  "message": "Product created successfully",
  "product": {
    "id": "550e8400-e29b-41d4-a716-446655440002",
    "name": "เสื้อโปโลผู้ชาย",
    "description": "เสื้อโปโลผ้าคอตตอน สีน้ำเงิน ใส่สบาย",
    "price": "890.00",
    "sku": "เสื้อโป-789123",
    "image": "data:image/jpeg;base64,/9j/4AAQSkZJRgABA...",
    "inventory": {
      "quantity": 150,
      "trackInventory": true,
      "lowStockThreshold": 10
    },
    "isActive": true,
    "category": {
      "name": "General",
      "slug": "general"
    },
    "createdAt": "2024-01-20T16:45:00.000Z",
    "updatedAt": "2024-01-20T16:45:00.000Z"
  }
}
```

#### 3. แก้ไขสินค้า
```bash
PUT /api/products/:id
Authorization: Bearer admin_jwt_token_here
Content-Type: application/json

{
  "name": "iPhone 15 Pro (ราคาใหม่)",
  "price": 42900,
  "isActive": true,
  "inventory": {
    "quantity": 75
  }
}
```

**🔧 ตัวอย่างการใช้งาน:**
```javascript
const updateProduct = async (productId) => {
  const response = await fetch(`/api/products/${productId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${adminToken}`
    },
    body: JSON.stringify({
      price: 39900,  // ลดราคา
      isActive: true,  // เปิดใช้งาน
      description: "รายละเอียดที่อัพเดทแล้ว"
    })
  });
  console.log('อัพเดทสำเร็จ');
};
```

**Response:**
```json
{
  "message": "Product updated successfully",
  "product": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "iPhone 15 Pro (ราคาใหม่)",
    "description": "รายละเอียดที่อัพเดทแล้ว",
    "price": "39900.00",
    "isActive": true,
    "category": {
      "name": "Electronics",
      "slug": "electronics"
    },
    "updatedAt": "2024-01-20T16:45:00.000Z"
  }
}
```

#### 4. ลบสินค้า
```bash
DELETE /api/products/:id
Authorization: Bearer admin_jwt_token_here
```

**🔧 การใช้งาน:**
```javascript
const deleteProduct = async (productId) => {
  if (confirm('คุณต้องการลบสินค้านี้หรือไม่?')) {
    await fetch(`/api/products/${productId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    alert('ลบสินค้าสำเร็จ');
  }
};
```

**Response:**
```json
{
  "message": "Product deleted successfully"
}
```

#### 5. อัพเดทสถานะสินค้าแบบ bulk
```bash
PATCH /api/products/admin/bulk-status
Authorization: Bearer admin_jwt_token_here
Content-Type: application/json

{
  "productIds": ["product-uuid-1", "product-uuid-2", "product-uuid-3"],
  "isActive": false
}
```

**🔧 การใช้งาน:**
```javascript
// ปิดใช้งานสินค้าหลายรายการพร้อมกัน
const bulkDisableProducts = async (selectedProductIds) => {
  const response = await fetch('/api/products/admin/bulk-status', {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${adminToken}`
    },
    body: JSON.stringify({
      productIds: selectedProductIds,
      isActive: false
    })
  });
  
  const result = await response.json();
  alert(`อัพเดท ${result.updatedCount} สินค้าสำเร็จ`);
};

// เปิดใช้งานสินค้าหลายรายการ
const bulkEnableProducts = async (productIds) => {
  await fetch('/api/products/admin/bulk-status', {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${adminToken}`
    },
    body: JSON.stringify({
      productIds: productIds,
      isActive: true
    })
  });
};
```

**Response:**
```json
{
  "message": "3 products updated successfully",
  "updatedCount": 3
}
```

#### 6. จัดการ Inventory (คลังสินค้า)
```bash
PATCH /api/products/admin/:id/inventory
Authorization: Bearer admin_jwt_token_here
Content-Type: application/json

{
  "quantity": 150,
  "lowStockThreshold": 20,
  "trackInventory": true
}
```

**🔧 การใช้งาน:**
```javascript
// เพิ่มสต็อกสินค้า
const addStock = async (productId, additionalStock) => {
  const response = await fetch(`/api/products/admin/${productId}/inventory`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${adminToken}`
    },
    body: JSON.stringify({
      quantity: additionalStock,
      lowStockThreshold: 10
    })
  });
  
  const result = await response.json();
  console.log('อัพเดทคลังสินค้าแล้ว:', result.product.inventory);
};

// ปรับแต่งการแจ้งเตือนสต็อกต่ำ
const updateLowStockAlert = async (productId, threshold) => {
  await fetch(`/api/products/admin/${productId}/inventory`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${adminToken}`
    },
    body: JSON.stringify({
      lowStockThreshold: threshold,
      trackInventory: true
    })
  });
};
```

**Response:**
```json
{
  "message": "Product inventory updated successfully",
  "product": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "iPhone 15 Pro",
    "inventory": {
      "quantity": 150,
      "lowStockThreshold": 20,
      "trackInventory": true
    },
    "category": {
      "name": "Electronics",
      "slug": "electronics"
    },
    "updatedAt": "2024-01-20T17:15:00.000Z"
  }
}
```

### 📊 Admin Dashboard Analytics (การวิเคราะห์ข้อมูลแดชบอร์ด)

#### 1. ภาพรวมแดชบอร์ด
```bash
GET /api/admin/dashboard/overview
Authorization: Bearer admin_jwt_token_here
```

**🔧 การใช้งาน:**
```javascript
const getDashboardOverview = async () => {
  const response = await fetch('/api/admin/dashboard/overview', {
    headers: { 'Authorization': `Bearer ${adminToken}` }
  });
  const data = await response.json();
  
  // แสดงข้อมูลภาพรวม
  console.log('ยอดขายรวม:', data.data.totalSales.value);
  console.log('จำนวนออร์เดอร์:', data.data.totalOrders.value);
  console.log('จำนวนผู้ใช้:', data.data.totalUsers.value);
  console.log('อัตราการเปลี่ยนแปลง:', data.data.totalSales.change + '%');
};
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalSales": {
      "value": 2547890.50,
      "change": "15.3",
      "isPositive": true
    },
    "totalOrders": {
      "value": 342,
      "change": "8.7",
      "isPositive": true
    },
    "totalUsers": {
      "value": 1284,
      "change": "12.1",
      "isPositive": true
    },
    "newUsers": {
      "value": 47,
      "change": "23.5",
      "isPositive": true
    },
    "avgOrderValue": {
      "value": 7456.42,
      "change": "6.2",
      "isPositive": true
    },
    "conversionRate": {
      "value": 3.8,
      "change": "2.1",
      "isPositive": true
    }
  }
}
```

#### 2. ข้อมูลยอดขาย
```bash
GET /api/admin/dashboard/sales?period=daily&startDate=2024-01-01&endDate=2024-01-31
Authorization: Bearer admin_jwt_token_here
```

**🔧 การใช้งาน:**
```javascript
// ข้อมูลยอดขาย 7 วันล่าสุด
const getSalesData = async () => {
  const endDate = new Date().toISOString().split('T')[0];
  const startDate = new Date(Date.now() - 7*24*60*60*1000).toISOString().split('T')[0];
  
  const response = await fetch(`/api/admin/dashboard/sales?period=daily&startDate=${startDate}&endDate=${endDate}`, {
    headers: { 'Authorization': `Bearer ${adminToken}` }
  });
  
  const data = await response.json();
  console.log('ข้อมูลยอดขาย:', data.data.salesData);
};

// ข้อมูลยอดขายรายเดือน
const getMonthlySales = async () => {
  const response = await fetch('/api/admin/dashboard/sales?period=monthly', {
    headers: { 'Authorization': `Bearer ${adminToken}` }
  });
  const data = await response.json();
  return data.data.salesData;
};
```

**Response:**
```json
{
  "success": true,
  "data": {
    "period": "daily",
    "startDate": "2024-01-14",
    "endDate": "2024-01-21",
    "salesData": [
      {
        "date": "2024-01-14",
        "sales": 125300.50,
        "orders": 18,
        "avgOrderValue": 6961.14
      },
      {
        "date": "2024-01-15",
        "sales": 89750.25,
        "orders": 12,
        "avgOrderValue": 7479.19
      },
      {
        "date": "2024-01-16",
        "sales": 156890.00,
        "orders": 24,
        "avgOrderValue": 6537.08
      }
    ]
  }
}
```

#### 3. สินค้าขายดี
```bash
GET /api/admin/dashboard/products/top?limit=10
Authorization: Bearer admin_jwt_token_here
```

**🔧 การใช้งาน:**
```javascript
const getTopProducts = async (limit = 5) => {
  const response = await fetch(`/api/admin/dashboard/products/top?limit=${limit}`, {
    headers: { 'Authorization': `Bearer ${adminToken}` }
  });
  
  const data = await response.json();
  data.data.forEach((product, index) => {
    console.log(`${index + 1}. ${product.name} - ขายได้ ${product.totalSold} ชิ้น`);
  });
};
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "productId": "550e8400-e29b-41d4-a716-446655440000",
      "name": "iPhone 15 Pro",
      "totalSold": 156,
      "totalRevenue": "7168400.00",
      "category": "Electronics"
    },
    {
      "productId": "550e8400-e29b-41d4-a716-446655440001",
      "name": "MacBook Pro M3",
      "totalSold": 89,
      "totalRevenue": "7111100.00",
      "category": "Laptops"
    },
    {
      "productId": "550e8400-e29b-41d4-a716-446655440002",
      "name": "AirPods Pro",
      "totalSold": 234,
      "totalRevenue": "2106000.00",
      "category": "Audio"
    }
  ]
}
```

#### 4. การแจ้งเตือนคลังสินค้า
```bash
GET /api/admin/dashboard/inventory/alerts?threshold=10
Authorization: Bearer admin_jwt_token_here
```

**🔧 การใช้งาน:**
```javascript
const checkLowStock = async () => {
  const response = await fetch('/api/admin/dashboard/inventory/alerts?threshold=15', {
    headers: { 'Authorization': `Bearer ${adminToken}` }
  });
  
  const data = await response.json();
  
  if (data.data.count > 0) {
    alert(`⚠️ มีสินค้าที่สต็อกต่ำ ${data.data.count} รายการ`);
    data.data.products.forEach(product => {
      console.log(`${product.name} - เหลือ ${product.inventory.quantity} ชิ้น`);
    });
  }
};

// ตรวจสอบสต็อกต่ำทุก ๆ 5 นาที
setInterval(checkLowStock, 5 * 60 * 1000);
```

**Response:**
```json
{
  "success": true,
  "data": {
    "threshold": 15,
    "count": 3,
    "products": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440003",
        "name": "iPad Air",
        "sku": "IPAD-AIR-001",
        "inventory": {
          "quantity": 8,
          "lowStockThreshold": 15,
          "trackInventory": true
        },
        "category": {
          "name": "Tablets"
        }
      },
      {
        "id": "550e8400-e29b-41d4-a716-446655440004",
        "name": "Apple Watch Series 9",
        "sku": "AW-S9-001",
        "inventory": {
          "quantity": 12,
          "lowStockThreshold": 20,
          "trackInventory": true
        },
        "category": {
          "name": "Wearables"
        }
      }
    ]
  }
}
```

#### 5. รีเฟรชข้อมูลวิเคราะห์
```bash
POST /api/admin/dashboard/analytics/refresh
Authorization: Bearer admin_jwt_token_here
```

**🔧 การใช้งาน:**
```javascript
const refreshAnalytics = async () => {
  const response = await fetch('/api/admin/dashboard/analytics/refresh', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${adminToken}` }
  });
  
  const data = await response.json();
  console.log('รีเฟรชข้อมูลสำเร็จ:', data.message);
  
  // รีเฟรชหน้าแดชบอร์ดหลังจากอัพเดทข้อมูล
  await getDashboardOverview();
};
```

**Response:**
```json
{
  "success": true,
  "message": "Analytics data refreshed successfully",
  "data": {
    "date": "2024-01-20",
    "totalSales": "145820.75",
    "totalOrders": 23,
    "totalUsers": 1284,
    "newUsers": 8,
    "avgOrderValue": "6340.03",
    "conversionRate": "3.2"
  }
}
```

### 🛒 Admin Order Management (การจัดการออร์เดอร์)

#### 1. ดูออร์เดอร์ทั้งหมด
```bash
GET /api/orders?page=1&limit=20&status=pending
Authorization: Bearer admin_jwt_token_here
```

**🔧 การใช้งาน:**
```javascript
// ดูออร์เดอร์ที่รอดำเนินการ
const getPendingOrders = async () => {
  const response = await fetch('/api/orders?status=pending&limit=50', {
    headers: { 'Authorization': `Bearer ${adminToken}` }
  });
  const data = await response.json();
  return data.orders;
};

// ดูออร์เดอร์ที่เสร็จสมบูรณ์
const getCompletedOrders = async () => {
  const response = await fetch('/api/orders?status=completed', {
    headers: { 'Authorization': `Bearer ${adminToken}` }
  });
  return await response.json();
};
```

**Response:**
```json
{
  "orders": [
    {
      "id": "order-uuid-123",
      "orderNumber": "ORD-20240120-001",
      "userId": "user-uuid-456",
      "status": "pending",
      "totalPrice": "15400.00",
      "createdAt": "2024-01-20T10:30:00.000Z",
      "user": {
        "firstName": "สมชาย",
        "lastName": "ใจดี",
        "email": "somchai@example.com"
      },
      "shippingAddress": {
        "firstName": "สมชาย",
        "lastName": "ใจดี",
        "address": "123 ถนนสุขุมวิท",
        "city": "กรุงเทพมหานคร",
        "postalCode": "10110"
      }
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 3,
    "totalOrders": 47,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

#### 2. อัพเดทสถานะออร์เดอร์
```bash
PUT /api/orders/:id/status
Authorization: Bearer admin_jwt_token_here
Content-Type: application/json

{
  "status": "processing"
}
```

**🔧 การใช้งาน:**
```javascript
const updateOrderStatus = async (orderId, newStatus) => {
  const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
  
  if (!validStatuses.includes(newStatus)) {
    alert('สถานะไม่ถูกต้อง');
    return;
  }
  
  const response = await fetch(`/api/orders/${orderId}/status`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${adminToken}`
    },
    body: JSON.stringify({ status: newStatus })
  });
  
  if (response.ok) {
    alert(`อัพเดทสถานะเป็น ${newStatus} แล้ว`);
  }
};

// ตัวอย่างการใช้งาน
updateOrderStatus('order-uuid-123', 'shipped');
```

**Response:**
```json
{
  "message": "Order status updated successfully",
  "order": {
    "id": "order-uuid-123",
    "orderNumber": "ORD-20240120-001",
    "status": "shipped",
    "updatedAt": "2024-01-20T18:45:00.000Z"
  }
}
```

### 👥 Admin User Management (การจัดการผู้ใช้งาน)

#### 1. ดูผู้ใช้งานทั้งหมด
```bash
GET /api/users
Authorization: Bearer admin_jwt_token_here
```

**🔧 การใช้งาน:**
```javascript
const getAllUsers = async () => {
  const response = await fetch('/api/users', {
    headers: { 'Authorization': `Bearer ${adminToken}` }
  });
  
  const users = await response.json();
  console.log(`มีผู้ใช้งานทั้งหมด ${users.length} คน`);
  
  users.forEach(user => {
    console.log(`${user.firstName} ${user.lastName} - ${user.email} (${user.role})`);
  });
};
```

**Response:**
```json
[
  {
    "id": "user-uuid-001",
    "firstName": "สมชาย",
    "lastName": "ใจดี",
    "email": "somchai@example.com",
    "role": "user",
    "isVerified": true,
    "createdAt": "2024-01-10T08:30:00.000Z"
  },
  {
    "id": "user-uuid-002",
    "firstName": "สมหญิง",
    "lastName": "รักษ์ดี",
    "email": "somying@example.com",
    "role": "user",
    "isVerified": true,
    "createdAt": "2024-01-15T14:20:00.000Z"
  },
  {
    "id": "user-uuid-003",
    "firstName": "Admin",
    "lastName": "System",
    "email": "admin@example.com",
    "role": "admin",
    "isVerified": true,
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
]
```

### Admin Dashboard Analytics
#### Get Dashboard Overview
```bash
GET /api/admin/dashboard/overview
Authorization: Bearer admin_jwt_token_here
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalSales": {
      "value": 15420.50,
      "change": "12.5",
      "isPositive": true
    },
    "totalOrders": {
      "value": 45,
      "change": "-3.2",
      "isPositive": false
    },
    "totalUsers": {
      "value": 1250,
      "change": "2.1",
      "isPositive": true
    },
    "newUsers": {
      "value": 15,
      "change": "25.0",
      "isPositive": true
    },
    "avgOrderValue": {
      "value": 342.68,
      "change": "8.9",
      "isPositive": true
    },
    "conversionRate": {
      "value": 0.036,
      "change": "1.5",
      "isPositive": true
    }
  }
}
```

#### Get Sales Analytics
```bash
GET /api/admin/dashboard/sales?period=daily&startDate=2024-01-01&endDate=2024-01-31
Authorization: Bearer admin_jwt_token_here
```

#### Get Order Status Distribution
```bash
GET /api/admin/dashboard/orders/status
Authorization: Bearer admin_jwt_token_here
```

#### Get Top Selling Products
```bash
GET /api/admin/dashboard/products/top?limit=10
Authorization: Bearer admin_jwt_token_here
```

#### Get Inventory Alerts
```bash
GET /api/admin/dashboard/inventory/alerts?threshold=10
Authorization: Bearer admin_jwt_token_here
```

#### Refresh Analytics Data
```bash
POST /api/admin/dashboard/analytics/refresh
Authorization: Bearer admin_jwt_token_here
```

**📊 Complete Admin Dashboard API Endpoints:**
- `/api/admin/dashboard/overview` - Overview statistics
- `/api/admin/dashboard/sales` - Sales analytics with date range
- `/api/admin/dashboard/orders/status` - Order status distribution
- `/api/admin/dashboard/payments/status` - Payment status distribution
- `/api/admin/dashboard/products/top` - Top selling products
- `/api/admin/dashboard/categories/top` - Top categories
- `/api/admin/dashboard/users/growth` - User growth analytics
- `/api/admin/dashboard/orders/recent` - Recent orders
- `/api/admin/dashboard/inventory/alerts` - Low stock alerts
- `/api/admin/dashboard/analytics/refresh` - Refresh analytics data

**🔐 Admin Authorization Required:**
- All admin dashboard and product management endpoints require JWT token with `admin` role
- Regular users cannot access these endpoints

## 📋 Complete API Endpoints Summary

### 🔓 **Public Endpoints (No Authentication Required):**
- `GET /api/health` - Server health check
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh JWT token
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password/:token` - Reset password
- `GET /api/products` - Get all products with filtering
- `GET /api/products/:id` - Get single product
- `GET /api/products/categories/list` - Get product categories
- `GET /api/simple-products` - Get all simple products
- `GET /api/simple-products/:id` - Get single simple product

### 🔐 **User Endpoints (Authentication Required):**
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `PUT /api/users/change-password` - Change password
- `GET /api/cart` - Get user cart
- `POST /api/cart/items` - Add item to cart
- `PUT /api/cart/items/:productId` - Update cart item
- `DELETE /api/cart/items/:productId` - Remove item from cart
- `DELETE /api/cart` - Clear cart
- `GET /api/simple-cart` - Get simple cart
- `POST /api/simple-cart/items` - Add to simple cart
- `PUT /api/simple-cart/items/:productId` - Update simple cart item
- `DELETE /api/simple-cart/items/:productId` - Remove from simple cart
- `DELETE /api/simple-cart` - Clear simple cart
- `GET /api/shipping-addresses` - Get shipping addresses
- `POST /api/shipping-addresses` - Create shipping address
- `PUT /api/shipping-addresses/:id` - Update shipping address
- `DELETE /api/shipping-addresses/:id` - Delete shipping address
- `PATCH /api/shipping-addresses/:id/default` - Set default address
- `POST /api/simple-orders` - Create simple order
- `GET /api/simple-orders` - Get user orders
- `GET /api/simple-orders/:id` - Get single order
- `PUT /api/simple-orders/:id/status` - Update order status
- `POST /api/payments` - Create payment
- `GET /api/payments` - Get user payments
- `GET /api/payments/status/:status` - Get payments by status
- `PUT /api/payments/:id/status` - Update payment status
- `GET /api/order-history` - Get order history
- `GET /api/order-history/stats` - Get order statistics

### 👑 **Admin Endpoints (Admin Role Required):**
- `GET /api/users` - Get all users
- `POST /api/products` - Create product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product
- `GET /api/products/admin/all` - Get all products (including inactive)
- `PATCH /api/products/admin/bulk-status` - Bulk update product status
- `PATCH /api/products/admin/:id/inventory` - Update product inventory
- `GET /api/orders` - Get all orders
- `GET /api/orders/:id` - Get single order
- `PUT /api/orders/:id/status` - Update order status
- `DELETE /api/orders/:id` - Delete order
- `GET /api/admin/dashboard/overview` - Dashboard overview
- `GET /api/admin/dashboard/sales` - Sales analytics
- `GET /api/admin/dashboard/orders/status` - Order status distribution
- `GET /api/admin/dashboard/payments/status` - Payment status distribution
- `GET /api/admin/dashboard/products/top` - Top selling products
- `GET /api/admin/dashboard/categories/top` - Top categories
- `GET /api/admin/dashboard/users/growth` - User growth analytics
- `GET /api/admin/dashboard/orders/recent` - Recent orders
- `GET /api/admin/dashboard/inventory/alerts` - Inventory alerts
- `POST /api/admin/dashboard/analytics/refresh` - Refresh analytics

### 📊 **API Statistics:**
- **Total Endpoints**: 50+
- **Public Endpoints**: 11
- **User Endpoints**: 25
- **Admin Endpoints**: 19
- **Authentication Methods**: JWT with Role-based Access Control

## Complete E-commerce Workflow

### Frontend Integration Example

```javascript
// 1. Create Order
const createOrder = async () => {
  const response = await fetch('/api/simple-orders', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${userToken}`
    },
    body: JSON.stringify({
      shippingAddress: {
        firstName: "John",
        lastName: "Doe",
        address: "123 Main Street",
        city: "Bangkok",
        postalCode: "10110"
      },
      paymentMethod: "credit_card",
      totalAmount: 299.99,
      items: [
        {
          productId: "product-123",
          name: "Product Name",
          quantity: 2,
          price: 149.99
        }
      ]
    })
  });
  
  const result = await response.json();
  return result.order.id; // orderId for payment
};

// 2. Create Payment
const createPayment = async (orderId) => {
  const response = await fetch('/api/payments', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${userToken}`
    },
    body: JSON.stringify({
      orderId: orderId,
      amount: 299.99,
      paymentMethod: "credit_card"
    })
  });
  
  const result = await response.json();
  return result.payment.id; // paymentId for status update
};

// 3. Update Payment Status
const updatePaymentStatus = async (paymentId, status) => {
  await fetch(`/api/payments/${paymentId}/status`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${userToken}`
    },
    body: JSON.stringify({
      paymentStatus: status // "completed", "failed", etc.
    })
  });
};

// Complete flow
const processOrder = async () => {
  try {
    const orderId = await createOrder();
    const paymentId = await createPayment(orderId);
    await updatePaymentStatus(paymentId, 'completed');
    console.log('Order and payment processed successfully');
  } catch (error) {
    console.error('Process failed:', error);
  }
};
```

### React Component Example

```jsx
const CheckoutPage = () => {
  const [orderId, setOrderId] = useState(null);
  const [loading, setLoading] = useState(false);

  const handlePlaceOrder = async () => {
    setLoading(true);
    try {
      const newOrderId = await createOrder();
      setOrderId(newOrderId);
      
      // Immediately process payment
      const paymentId = await createPayment(newOrderId);
      await updatePaymentStatus(paymentId, 'completed');
      
      alert('Order placed and payment completed successfully!');
    } catch (error) {
      console.error('Order failed:', error);
      alert('Order failed. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div>
      <button onClick={handlePlaceOrder} disabled={loading}>
        {loading ? 'Processing...' : 'Place Order & Pay'}
      </button>
    </div>
  );
};
```

## Important Notes for Frontend Developers

### ⚠️ **API Endpoint Changes:**
- **❌ Don't use**: `/api/orders` (requires Admin permission)
- **✅ Use instead**: `/api/simple-orders` (works for regular users)

### 🔄 **Correct Order Flow:**
1. **Create Order**: `POST /api/simple-orders`
2. **Get orderId**: From order response
3. **Create Payment**: `POST /api/payments` with orderId
4. **Update Status**: `PUT /api/payments/:id/status`

### 🔑 **Authentication:**
- All APIs require JWT token in Authorization header
- Use format: `Authorization: Bearer YOUR_JWT_TOKEN`
- Token obtained from login/register endpoints

### 💡 **Key Benefits:**
- **No Cart Dependency**: Orders can be created directly
- **User-Friendly**: No admin permissions required
- **Fallback Mechanism**: Works even if other systems fail
- **Complete Integration**: Order → Payment → Status tracking

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
- User-specific data access control

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

### Database Migration for Analytics
Run the following SQL script to create the analytics table:
```bash
# Connect to PostgreSQL and run:
psql -h localhost -p 5432 -U ecommerce_user -d ecommerce_db -f migrations/create-analytics-table.sql
```

Or use the migration file: `migrations/create-analytics-table.sql`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the ISC License.