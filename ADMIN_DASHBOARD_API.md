# Admin Dashboard API Documentation

## Overview
API endpoints สำหรับหน้า dashboard ของ admin ที่จะแสดงข้อมูลสถิติและการวิเคราะห์ต่างๆ ของระบบ e-commerce

## Base URL
```
/api/admin/dashboard
```

## Authentication
ทุก endpoint ต้องการ:
- JWT token ในรูปแบบ `Bearer <token>`
- User ต้องมี role เป็น `admin`

## API Endpoints

### 1. Get Overview Statistics
```http
GET /api/admin/dashboard/overview
```

**Description:** ข้อมูลสถิติภาพรวมของวันนี้เปรียบเทียบกับเมื่อวาน

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

### 2. Get Sales Analytics
```http
GET /api/admin/dashboard/sales?period=daily&startDate=2024-01-01&endDate=2024-01-31
```

**Parameters:**
- `period` (optional): `daily`, `weekly`, `monthly` (default: daily)
- `startDate` (optional): YYYY-MM-DD format
- `endDate` (optional): YYYY-MM-DD format

**Response:**
```json
{
  "success": true,
  "data": {
    "period": "daily",
    "startDate": "2024-01-01",
    "endDate": "2024-01-31",
    "salesData": [
      {
        "date": "2024-01-01",
        "sales": 12450.00,
        "orders": 35,
        "avgOrderValue": 355.71
      }
    ]
  }
}
```

### 3. Get Order Status Distribution
```http
GET /api/admin/dashboard/orders/status
```

**Response:**
```json
{
  "success": true,
  "data": {
    "pending": 12,
    "processing": 8,
    "shipped": 25,
    "delivered": 150,
    "cancelled": 3,
    "refunded": 2
  }
}
```

### 4. Get Payment Status Distribution
```http
GET /api/admin/dashboard/payments/status
```

**Response:**
```json
{
  "success": true,
  "data": {
    "pending": 5,
    "processing": 10,
    "completed": 180,
    "failed": 8,
    "cancelled": 2,
    "refunded": 3
  }
}
```

### 5. Get Top Selling Products
```http
GET /api/admin/dashboard/products/top?limit=10
```

**Parameters:**
- `limit` (optional): จำนวนสินค้าที่ต้องการ (1-50, default: 10)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "product-uuid",
      "name": "iPhone 14 Pro",
      "sales_count": 25,
      "total_quantity": 25
    }
  ]
}
```

### 6. Get Top Categories
```http
GET /api/admin/dashboard/categories/top?limit=10
```

**Parameters:**
- `limit` (optional): จำนวนหมวดหมู่ที่ต้องการ (1-20, default: 10)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "category-uuid",
      "name": "Electronics",
      "sales_count": 150
    }
  ]
}
```

### 7. Get User Growth Analytics
```http
GET /api/admin/dashboard/users/growth?days=30
```

**Parameters:**
- `days` (optional): จำนวนวันย้อนหลัง (7-365, default: 30)

**Response:**
```json
{
  "success": true,
  "data": {
    "period": "30 days",
    "userGrowthData": [
      {
        "date": "2024-01-01",
        "totalUsers": 1200,
        "newUsers": 15
      }
    ]
  }
}
```

### 8. Get Recent Orders
```http
GET /api/admin/dashboard/orders/recent?limit=10
```

**Parameters:**
- `limit` (optional): จำนวนคำสั่งซื้อ (1-50, default: 10)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "order-uuid",
      "orderNumber": "ORD-001",
      "status": "delivered",
      "total_price": "299.99",
      "createdAt": "2024-01-01T10:30:00Z",
      "user": {
        "firstName": "John",
        "lastName": "Doe",
        "email": "john@example.com"
      }
    }
  ]
}
```

### 9. Refresh Analytics Data
```http
POST /api/admin/dashboard/analytics/refresh
```

**Description:** คำนวณและอัปเดตข้อมูลสถิติใหม่

**Response:**
```json
{
  "success": true,
  "message": "Analytics data refreshed successfully",
  "data": {
    // Analytics object
  }
}
```

### 10. Get Inventory Alerts
```http
GET /api/admin/dashboard/inventory/alerts?threshold=10
```

**Parameters:**
- `threshold` (optional): จำนวนสินค้าคงคลังที่ถือว่าต่ำ (default: 10)

**Response:**
```json
{
  "success": true,
  "data": {
    "threshold": 10,
    "count": 5,
    "products": [
      {
        "id": "product-uuid",
        "name": "Product Name",
        "sku": "SKU-001",
        "inventory": {
          "quantity": 5,
          "trackInventory": true
        },
        "category": {
          "name": "Electronics"
        }
      }
    ]
  }
}
```

## Error Responses

### 401 Unauthorized
```json
{
  "success": false,
  "message": "No token, authorization denied"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "Access denied. Admin role required."
}
```

### 400 Bad Request
```json
{
  "success": false,
  "errors": [
    {
      "msg": "Validation error message",
      "param": "parameter_name",
      "location": "query"
    }
  ]
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Server error",
  "error": "Error details"
}
```

## Usage Examples

### JavaScript/Axios
```javascript
// Get overview statistics
const response = await axios.get('/api/admin/dashboard/overview', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

// Get sales data for last 7 days
const salesData = await axios.get('/api/admin/dashboard/sales', {
  params: {
    period: 'daily',
    startDate: '2024-01-01',
    endDate: '2024-01-07'
  },
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

### cURL
```bash
# Get overview statistics
curl -H "Authorization: Bearer YOUR_TOKEN" \
     -X GET http://localhost:3001/api/admin/dashboard/overview

# Refresh analytics data
curl -H "Authorization: Bearer YOUR_TOKEN" \
     -X POST http://localhost:3001/api/admin/dashboard/analytics/refresh
```

## Database Dependencies
- `analytics` table สำหรับเก็บข้อมูลสถิติรายวัน
- ต้องรัน migration script เพื่อสร้างตาราง
- ข้อมูลจะถูกคำนวณและอัปเดตแบบ real-time หรือตามตารางเวลาที่กำหนด