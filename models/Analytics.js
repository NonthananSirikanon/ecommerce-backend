const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Analytics = sequelize.define('Analytics', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    unique: true
  },
  totalSales: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0.00,
    allowNull: false
  },
  totalOrders: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    allowNull: false
  },
  totalUsers: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    allowNull: false
  },
  newUsers: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    allowNull: false
  },
  totalProducts: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    allowNull: false
  },
  ordersStatus: {
    type: DataTypes.JSONB,
    defaultValue: {
      pending: 0,
      processing: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0,
      refunded: 0
    }
  },
  paymentsStatus: {
    type: DataTypes.JSONB,
    defaultValue: {
      pending: 0,
      processing: 0,
      completed: 0,
      failed: 0,
      cancelled: 0,
      refunded: 0
    }
  },
  topSellingProducts: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  topCategories: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  avgOrderValue: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00
  },
  conversionRate: {
    type: DataTypes.DECIMAL(5, 4),
    defaultValue: 0.0000
  }
}, {
  tableName: 'analytics',
  indexes: [
    {
      fields: ['date']
    }
  ]
});

// Static method to calculate daily analytics
Analytics.calculateDailyAnalytics = async function(date = new Date()) {
  const { Op } = require('sequelize');
  const User = require('./User');
  const { Order } = require('./Order');  
  const { Product } = require('./Product');
  const Category = require('./Category');
  const Payment = require('./Payment');
  
  const targetDate = new Date(date);
  targetDate.setHours(0, 0, 0, 0);
  
  const nextDate = new Date(targetDate);
  nextDate.setDate(nextDate.getDate() + 1);

  try {
    // Calculate total sales and orders for the day
    const dailyOrders = await Order.findAll({
      where: {
        created_at: {
          [Op.gte]: targetDate,
          [Op.lt]: nextDate
        }
      },
      include: [
        {
          model: Payment,
          as: 'payments'
        }
      ]
    });

    const totalSales = dailyOrders.reduce((sum, order) => sum + parseFloat(order.total_price || 0), 0);
    const totalOrders = dailyOrders.length;

    // Calculate order status distribution
    const ordersStatus = {
      pending: 0,
      processing: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0,
      refunded: 0
    };

    dailyOrders.forEach(order => {
      if (ordersStatus.hasOwnProperty(order.status)) {
        ordersStatus[order.status]++;
      }
    });

    // Calculate total users and new users
    const totalUsers = await User.count();
    const newUsers = await User.count({
      where: {
        created_at: {
          [Op.gte]: targetDate,
          [Op.lt]: nextDate
        }
      }
    });

    // Calculate total products
    const totalProducts = await Product.count({
      where: {
        is_active: true
      }
    });

    // Calculate payment status distribution
    const dailyPayments = await Payment.findAll({
      where: {
        created_at: {
          [Op.gte]: targetDate,
          [Op.lt]: nextDate
        }
      }
    });

    const paymentsStatus = {
      pending: 0,
      processing: 0,
      completed: 0,
      failed: 0,
      cancelled: 0,
      refunded: 0
    };

    dailyPayments.forEach(payment => {
      if (paymentsStatus.hasOwnProperty(payment.payment_status)) {
        paymentsStatus[payment.payment_status]++;
      }
    });

    // Calculate average order value
    const avgOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;

    // Calculate conversion rate (orders / total users)
    const conversionRate = totalUsers > 0 ? totalOrders / totalUsers : 0;

    // Get top selling products (for the last 30 days)
    const last30Days = new Date(targetDate);
    last30Days.setDate(last30Days.getDate() - 30);

    const topProducts = await sequelize.query(`
      SELECT p.id, p.name, COUNT(oi.id) as sales_count, SUM(oi.quantity) as total_quantity
      FROM products p
      JOIN order_items oi ON p.id = oi.product_id
      JOIN orders o ON oi.order_id = o.id
      WHERE o.created_at >= :last30Days AND o.created_at < :nextDate
      GROUP BY p.id, p.name
      ORDER BY sales_count DESC
      LIMIT 10
    `, {
      replacements: { last30Days, nextDate },
      type: sequelize.QueryTypes.SELECT
    });

    // Get top categories (for the last 30 days)
    const topCategories = await sequelize.query(`
      SELECT c.id, c.name, COUNT(oi.id) as sales_count
      FROM categories c
      JOIN products p ON c.id = p.category_id
      JOIN order_items oi ON p.id = oi.product_id
      JOIN orders o ON oi.order_id = o.id
      WHERE o.created_at >= :last30Days AND o.created_at < :nextDate
      GROUP BY c.id, c.name
      ORDER BY sales_count DESC
      LIMIT 10
    `, {
      replacements: { last30Days, nextDate },
      type: sequelize.QueryTypes.SELECT
    });

    // Update or create analytics record
    const [analytics, created] = await Analytics.findOrCreate({
      where: { date: targetDate.toISOString().split('T')[0] },
      defaults: {
        totalSales,
        totalOrders,
        totalUsers,
        newUsers,
        totalProducts,
        ordersStatus,
        paymentsStatus,
        topSellingProducts: topProducts,
        topCategories,
        avgOrderValue,
        conversionRate
      }
    });

    if (!created) {
      await analytics.update({
        totalSales,
        totalOrders,
        totalUsers,
        newUsers,
        totalProducts,
        ordersStatus,
        paymentsStatus,
        topSellingProducts: topProducts,
        topCategories,
        avgOrderValue,
        conversionRate
      });
    }

    return analytics;
  } catch (error) {
    console.error('Error calculating daily analytics:', error);
    throw error;
  }
};

module.exports = Analytics;