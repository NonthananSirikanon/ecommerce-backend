const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const OrderHistory = sequelize.define('OrderHistory', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  orderId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'orders',
      key: 'id'
    }
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  orderNumber: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  orderStatus: {
    type: DataTypes.ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'),
    allowNull: false
  },
  paymentStatus: {
    type: DataTypes.ENUM('pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded'),
    allowNull: false,
    defaultValue: 'pending'
  },
  totalAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0,
      isDecimal: true
    }
  },
  currency: {
    type: DataTypes.STRING(3),
    defaultValue: 'THB',
    allowNull: false
  },
  itemCount: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1
    }
  },
  shippingAddress: {
    type: DataTypes.JSON,
    allowNull: false
  },
  billingAddress: {
    type: DataTypes.JSON,
    allowNull: false
  },
  paymentMethod: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  trackingNumber: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  shippingProvider: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  orderItems: {
    type: DataTypes.JSON,
    allowNull: false
  },
  paymentDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  shippedDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  deliveredDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  statusHistory: {
    type: DataTypes.JSON,
    defaultValue: [],
    allowNull: false
  }
}, {
  underscored: true,
  hooks: {
    beforeCreate: async (orderHistory) => {
      const initialStatus = {
        status: orderHistory.orderStatus,
        paymentStatus: orderHistory.paymentStatus,
        timestamp: new Date(),
        note: 'Order created'
      };
      orderHistory.statusHistory = [initialStatus];
    },
    beforeUpdate: async (orderHistory) => {
      if (orderHistory.changed('orderStatus') || orderHistory.changed('paymentStatus')) {
        const statusUpdate = {
          status: orderHistory.orderStatus,
          paymentStatus: orderHistory.paymentStatus,
          timestamp: new Date(),
          note: `Status updated to ${orderHistory.orderStatus}, Payment: ${orderHistory.paymentStatus}`
        };
        
        const currentHistory = orderHistory.statusHistory || [];
        orderHistory.statusHistory = [...currentHistory, statusUpdate];
      }
      
      if (orderHistory.paymentStatus === 'completed' && !orderHistory.paymentDate) {
        orderHistory.paymentDate = new Date();
      }
      
      if (orderHistory.orderStatus === 'shipped' && !orderHistory.shippedDate) {
        orderHistory.shippedDate = new Date();
      }
      
      if (orderHistory.orderStatus === 'delivered' && !orderHistory.deliveredDate) {
        orderHistory.deliveredDate = new Date();
      }
    }
  },
  indexes: [
    { fields: ['user_id'] },
    { fields: ['order_id'] },
    { fields: ['order_status'] },
    { fields: ['payment_status'] },
    { fields: ['order_number'] },
    { fields: ['created_at'] },
    { fields: ['user_id', 'order_status'] },
    { fields: ['user_id', 'payment_status'] }
  ]
});

module.exports = OrderHistory;