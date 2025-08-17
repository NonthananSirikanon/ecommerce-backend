# E-commerce Backend API

A comprehensive Express.js backend API for an e-commerce application with user authentication, product management, shopping cart, and order processing.

## Features

- **User Authentication & Authorization**
  - User registration and login
  - JWT token-based authentication
  - Password reset functionality
  - Role-based access control (User/Admin)

- **Product Management**
  - CRUD operations for products
  - Product categories and subcategories
  - Product reviews and ratings
  - Inventory tracking
  - Search and filtering capabilities

- **Shopping Cart**
  - Add/remove items from cart
  - Update item quantities
  - Cart persistence for logged-in users

- **Order Management**
  - Order creation and tracking
  - Order status updates
  - Order history for users
  - Admin order management

- **User Profile Management**
  - Profile updates
  - Address management
  - Wishlist functionality

## Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: Express Validator
- **Security**: Helmet, CORS, Rate Limiting
- **Password Hashing**: bcryptjs

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- npm or yarn package manager

### Installation

1. Clone the repository
```bash
git clone https://github.com/NonthananSirikanon/ecommerce-backend.git
cd ecommerce-backend
```

2. Install dependencies
```bash
npm install
```

3. Create environment variables
```bash
cp .env.example .env
```

4. Update the `.env` file with your configuration:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/ecommerce
JWT_SECRET=your_jwt_secret_key_here
JWT_REFRESH_SECRET=your_jwt_refresh_secret_key_here
STRIPE_SECRET_KEY=your_stripe_secret_key
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_password
CLIENT_URL=http://localhost:3000
```

5. Start the development server
```bash
npm run dev
```

The server will start on `http://localhost:5000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh-token` - Refresh JWT token
- `GET /api/auth/me` - Get current user profile
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password

### Products
- `GET /api/products` - Get all products (with filtering, pagination)
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product (Admin only)
- `PUT /api/products/:id` - Update product (Admin only)
- `DELETE /api/products/:id` - Delete product (Admin only)
- `POST /api/products/:id/reviews` - Add product review

### Cart
- `GET /api/cart` - Get user's cart
- `POST /api/cart/add` - Add item to cart
- `PUT /api/cart/update/:itemId` - Update cart item quantity
- `DELETE /api/cart/remove/:itemId` - Remove item from cart
- `DELETE /api/cart/clear` - Clear entire cart

### Orders
- `POST /api/orders/create` - Create new order
- `GET /api/orders/my-orders` - Get user's orders
- `GET /api/orders/:id` - Get single order
- `GET /api/orders` - Get all orders (Admin only)
- `PUT /api/orders/:id/status` - Update order status (Admin only)
- `POST /api/orders/:id/cancel` - Cancel order

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `POST /api/users/addresses` - Add user address
- `PUT /api/users/addresses/:id` - Update user address
- `DELETE /api/users/addresses/:id` - Delete user address
- `POST /api/users/wishlist/:productId` - Add to wishlist
- `DELETE /api/users/wishlist/:productId` - Remove from wishlist
- `GET /api/users/wishlist` - Get user wishlist

## Database Models

### User Model
- Personal information (name, email, phone)
- Authentication credentials
- Addresses (shipping/billing)
- Wishlist
- Role-based permissions

### Product Model
- Basic product information
- Pricing and inventory
- Categories and tags
- Images and variants
- Reviews and ratings

### Cart Model
- User-specific cart items
- Quantity and pricing
- Auto-calculation of totals

### Order Model
- Order items and pricing
- Shipping and billing addresses
- Payment information
- Order status tracking

### Category Model
- Hierarchical category structure
- SEO-friendly slugs
- Active/inactive status

## Security Features

- Password hashing with bcrypt
- JWT token authentication
- Rate limiting to prevent abuse
- CORS configuration
- Helmet for security headers
- Input validation and sanitization

## Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm test` - Run tests
- `npm run lint` - Run ESLint

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the ISC License.