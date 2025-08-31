const express = require('express');
const { query, validationResult } = require('express-validator');
const { Op } = require('sequelize');
const { sequelize } = require('../config/database');
const { User, Order, Product, Category, Payment, Analytics } = require('../models');
const { auth, admin } = require('../middleware/auth');

const router = express.Router();

// Get overview statistics
router.get('/overview', [auth, admin], async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Get overall statistics (not just today)
    const totalUsers = await User.count();
    const totalOrders = await Order.count();
    const totalSalesResult = await Order.findAll({
      attributes: [[sequelize.fn('SUM', sequelize.cast(sequelize.col('total_price'), 'DECIMAL')), 'totalSales']]
    });
    const totalSales = parseFloat(totalSalesResult[0]?.dataValues?.totalSales || 0);
    
    // Get today's analytics for comparison
    let todayAnalytics = await Analytics.findOne({
      where: { date: today.toISOString().split('T')[0] }
    });

    // If no analytics for today, calculate them
    if (!todayAnalytics) {
      todayAnalytics = await Analytics.calculateDailyAnalytics(today);
    }

    // Get yesterday's analytics for comparison
    let yesterdayAnalytics = await Analytics.findOne({
      where: { date: yesterday.toISOString().split('T')[0] }
    });

    // Calculate percentage changes
    const calculateChange = (current, previous) => {
      if (!previous || previous === 0) return 0;
      return ((current - previous) / previous * 100).toFixed(2);
    };

    const overview = {
      totalSales: {
        value: totalSales,
        change: yesterdayAnalytics ? calculateChange(
          parseFloat(todayAnalytics.totalSales || 0),
          parseFloat(yesterdayAnalytics.totalSales || 0)
        ) : 0,
        isPositive: !yesterdayAnalytics || parseFloat(todayAnalytics.totalSales || 0) >= parseFloat(yesterdayAnalytics.totalSales || 0)
      },
      totalOrders: {
        value: totalOrders,
        change: yesterdayAnalytics ? calculateChange(
          todayAnalytics.totalOrders || 0,
          yesterdayAnalytics.totalOrders || 0
        ) : 0,
        isPositive: !yesterdayAnalytics || (todayAnalytics.totalOrders || 0) >= (yesterdayAnalytics.totalOrders || 0)
      },
      totalUsers: {
        value: totalUsers,
        change: yesterdayAnalytics ? calculateChange(
          todayAnalytics.totalUsers || 0,
          yesterdayAnalytics.totalUsers || 0
        ) : 0,
        isPositive: true
      },
      newUsers: {
        value: todayAnalytics.newUsers || 0,
        change: yesterdayAnalytics ? calculateChange(
          todayAnalytics.newUsers || 0,
          yesterdayAnalytics.newUsers || 0
        ) : 0,
        isPositive: !yesterdayAnalytics || (todayAnalytics.newUsers || 0) >= (yesterdayAnalytics.newUsers || 0)
      },
      avgOrderValue: {
        value: parseFloat(todayAnalytics.avgOrderValue || 0),
        change: yesterdayAnalytics ? calculateChange(
          parseFloat(todayAnalytics.avgOrderValue || 0),
          parseFloat(yesterdayAnalytics.avgOrderValue || 0)
        ) : 0,
        isPositive: !yesterdayAnalytics || parseFloat(todayAnalytics.avgOrderValue || 0) >= parseFloat(yesterdayAnalytics.avgOrderValue || 0)
      },
      conversionRate: {
        value: parseFloat(todayAnalytics.conversionRate || 0),
        change: yesterdayAnalytics ? calculateChange(
          parseFloat(todayAnalytics.conversionRate || 0),
          parseFloat(yesterdayAnalytics.conversionRate || 0)
        ) : 0,
        isPositive: !yesterdayAnalytics || parseFloat(todayAnalytics.conversionRate || 0) >= parseFloat(yesterdayAnalytics.conversionRate || 0)
      }
    };

    res.json({
      success: true,
      data: overview
    });
  } catch (error) {
    console.error('Dashboard overview error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// Get sales analytics with date range
router.get('/sales', [
  auth,
  admin,
  query('startDate').optional().isDate().withMessage('Start date must be a valid date'),
  query('endDate').optional().isDate().withMessage('End date must be a valid date'),
  query('period').optional().isIn(['daily', 'weekly', 'monthly']).withMessage('Period must be daily, weekly, or monthly')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const period = req.query.period || 'daily';
    const endDate = req.query.endDate ? new Date(req.query.endDate) : new Date();
    const startDate = req.query.startDate ? new Date(req.query.startDate) : (() => {
      const date = new Date(endDate);
      switch (period) {
        case 'weekly': date.setDate(date.getDate() - 7); break;
        case 'monthly': date.setMonth(date.getMonth() - 1); break;
        default: date.setDate(date.getDate() - 30); break;
      }
      return date;
    })();

    const analytics = await Analytics.findAll({
      where: {
        date: {
          [Op.gte]: startDate.toISOString().split('T')[0],
          [Op.lte]: endDate.toISOString().split('T')[0]
        }
      },
      order: [['date', 'ASC']]
    });

    const salesData = analytics.map(item => ({
      date: item.date,
      sales: parseFloat(item.totalSales),
      orders: item.totalOrders,
      avgOrderValue: parseFloat(item.avgOrderValue)
    }));

    res.json({
      success: true,
      data: {
        period,
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        salesData
      }
    });
  } catch (error) {
    console.error('Sales analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// Get order status distribution
router.get('/orders/status', [auth, admin], async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let todayAnalytics = await Analytics.findOne({
      where: { date: today.toISOString().split('T')[0] }
    });

    if (!todayAnalytics) {
      todayAnalytics = await Analytics.calculateDailyAnalytics(today);
    }

    res.json({
      success: true,
      data: todayAnalytics.ordersStatus
    });
  } catch (error) {
    console.error('Order status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// Get payment status distribution
router.get('/payments/status', [auth, admin], async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let todayAnalytics = await Analytics.findOne({
      where: { date: today.toISOString().split('T')[0] }
    });

    if (!todayAnalytics) {
      todayAnalytics = await Analytics.calculateDailyAnalytics(today);
    }

    res.json({
      success: true,
      data: todayAnalytics.paymentsStatus
    });
  } catch (error) {
    console.error('Payment status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// Get top selling products
router.get('/products/top', [
  auth,
  admin,
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const limit = parseInt(req.query.limit) || 10;
    const today = new Date();

    let todayAnalytics = await Analytics.findOne({
      where: { date: today.toISOString().split('T')[0] }
    });

    if (!todayAnalytics) {
      todayAnalytics = await Analytics.calculateDailyAnalytics(today);
    }

    const topProducts = todayAnalytics.topSellingProducts.slice(0, limit);

    res.json({
      success: true,
      data: topProducts
    });
  } catch (error) {
    console.error('Top products error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// Get top categories
router.get('/categories/top', [
  auth,
  admin,
  query('limit').optional().isInt({ min: 1, max: 20 }).withMessage('Limit must be between 1 and 20')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const limit = parseInt(req.query.limit) || 10;
    const today = new Date();

    let todayAnalytics = await Analytics.findOne({
      where: { date: today.toISOString().split('T')[0] }
    });

    if (!todayAnalytics) {
      todayAnalytics = await Analytics.calculateDailyAnalytics(today);
    }

    const topCategories = todayAnalytics.topCategories.slice(0, limit);

    res.json({
      success: true,
      data: topCategories
    });
  } catch (error) {
    console.error('Top categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// Get user growth analytics
router.get('/users/growth', [
  auth,
  admin,
  query('days').optional().isInt({ min: 7, max: 365 }).withMessage('Days must be between 7 and 365')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const days = parseInt(req.query.days) || 30;
    const endDate = new Date();
    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - days);

    const analytics = await Analytics.findAll({
      where: {
        date: {
          [Op.gte]: startDate.toISOString().split('T')[0],
          [Op.lte]: endDate.toISOString().split('T')[0]
        }
      },
      order: [['date', 'ASC']]
    });

    const userGrowthData = analytics.map(item => ({
      date: item.date,
      totalUsers: item.totalUsers,
      newUsers: item.newUsers
    }));

    res.json({
      success: true,
      data: {
        period: `${days} days`,
        userGrowthData
      }
    });
  } catch (error) {
    console.error('User growth error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// Get recent orders for admin dashboard
router.get('/orders/recent', [
  auth,
  admin,
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const limit = parseInt(req.query.limit) || 10;

    const recentOrders = await Order.findAll({
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['firstName', 'lastName', 'email']
        }
      ],
      order: [['created_at', 'DESC']],
      limit,
      attributes: ['id', 'order_number', 'status', 'total_price', 'created_at']
    });

    res.json({
      success: true,
      data: recentOrders
    });
  } catch (error) {
    console.error('Recent orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// Refresh analytics data
router.post('/analytics/refresh', [auth, admin], async (req, res) => {
  try {
    const today = new Date();
    const analytics = await Analytics.calculateDailyAnalytics(today);

    res.json({
      success: true,
      message: 'Analytics data refreshed successfully',
      data: analytics
    });
  } catch (error) {
    console.error('Analytics refresh error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// Get inventory alerts (low stock products)
router.get('/inventory/alerts', [
  auth,
  admin,
  query('threshold').optional().isInt({ min: 0 }).withMessage('Threshold must be a non-negative integer')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const threshold = parseInt(req.query.threshold) || 10;

    const lowStockProducts = await Product.findAll({
      where: {
        is_active: true,
        'inventory.quantity': {
          [Op.lte]: threshold
        },
        'inventory.trackInventory': true
      },
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['name']
        }
      ],
      attributes: ['id', 'name', 'sku', 'inventory'],
      order: [['inventory.quantity', 'ASC']]
    });

    res.json({
      success: true,
      data: {
        threshold,
        count: lowStockProducts.length,
        products: lowStockProducts
      }
    });
  } catch (error) {
    console.error('Inventory alerts error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

module.exports = router;