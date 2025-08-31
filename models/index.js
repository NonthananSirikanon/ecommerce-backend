const { sequelize } = require('../config/database');
const User = require('./User');
const Category = require('./Category');
const { Product, Review } = require('./Product');
const { Cart, CartItem } = require('./Cart');
const { Order, OrderItem } = require('./Order');
const ShippingAddress = require('./ShippingAddress');
const Payment = require('./Payment');
const OrderHistory = require('./OrderHistory');
const Analytics = require('./Analytics');

User.hasOne(Cart, { foreignKey: 'userId', as: 'cart' });
Cart.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(Order, { foreignKey: 'userId', as: 'orders' });
Order.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(Review, { foreignKey: 'userId', as: 'reviews' });
Review.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Category.hasMany(Product, { foreignKey: 'categoryId', as: 'products' });
Product.belongsTo(Category, { foreignKey: 'categoryId', as: 'category' });

Category.hasMany(Product, { foreignKey: 'subcategoryId', as: 'subcategoryProducts' });
Product.belongsTo(Category, { foreignKey: 'subcategoryId', as: 'subcategory' });

Product.hasMany(CartItem, { foreignKey: 'productId', as: 'cartItems' });
CartItem.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

Product.hasMany(OrderItem, { foreignKey: 'productId', as: 'orderItems' });
OrderItem.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

User.hasMany(ShippingAddress, { foreignKey: 'userId', as: 'shippingAddresses' });
ShippingAddress.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(Payment, { foreignKey: 'userId', as: 'payments' });
Payment.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Order.hasMany(Payment, { foreignKey: 'orderId', as: 'payments' });
Payment.belongsTo(Order, { foreignKey: 'orderId', as: 'order' });

User.hasMany(OrderHistory, { foreignKey: 'userId', as: 'orderHistories' });
OrderHistory.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Order.hasOne(OrderHistory, { foreignKey: 'orderId', as: 'history' });
OrderHistory.belongsTo(Order, { foreignKey: 'orderId', as: 'order' });

module.exports = {
  sequelize,
  User,
  Category,
  Product,
  Review,
  Cart,
  CartItem,
  Order,
  OrderItem,
  ShippingAddress,
  Payment,
  OrderHistory,
  Analytics
};