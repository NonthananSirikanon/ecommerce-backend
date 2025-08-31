const express = require('express');
const { body, query, validationResult } = require('express-validator');
const { OrderHistory, Order, Payment } = require('../models');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Get all order history for the authenticated user with pagination and filters
router.get('/', [
  auth,
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('orderStatus').optional().isIn(['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'])
    .withMessage('Invalid order status'),
  query('paymentStatus').optional().isIn(['pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded'])
    .withMessage('Invalid payment status'),
  query('dateFrom').optional().isISO8601().withMessage('Invalid date format for dateFrom'),
  query('dateTo').optional().isISO8601().withMessage('Invalid date format for dateTo')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const whereClause = { userId: req.user.id };
    
    if (req.query.orderStatus) {
      whereClause.orderStatus = req.query.orderStatus;
    }
    
    if (req.query.paymentStatus) {
      whereClause.paymentStatus = req.query.paymentStatus;
    }

    if (req.query.dateFrom || req.query.dateTo) {
      whereClause.createdAt = {};
      if (req.query.dateFrom) {
        whereClause.createdAt[require('sequelize').Op.gte] = new Date(req.query.dateFrom);
      }
      if (req.query.dateTo) {
        whereClause.createdAt[require('sequelize').Op.lte] = new Date(req.query.dateTo);
      }
    }

    const { count, rows } = await OrderHistory.findAndCountAll({
      where: whereClause,
      limit,
      offset,
      order: [['createdAt', 'DESC']]
    });

    const totalPages = Math.ceil(count / limit);

    res.json({
      success: true,
      orderHistory: rows,
      pagination: {
        currentPage: page,
        totalPages,
        totalOrders: count,
        ordersPerPage: limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      },
      count: rows.length
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// Get a specific order history by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const orderHistory = await OrderHistory.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });

    if (!orderHistory) {
      return res.status(404).json({
        success: false,
        message: 'Order history not found'
      });
    }

    res.json({
      success: true,
      orderHistory
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// Get order history by order number
router.get('/order-number/:orderNumber', auth, async (req, res) => {
  try {
    const orderHistory = await OrderHistory.findOne({
      where: {
        orderNumber: req.params.orderNumber,
        userId: req.user.id
      }
    });

    if (!orderHistory) {
      return res.status(404).json({
        success: false,
        message: 'Order history not found'
      });
    }

    res.json({
      success: true,
      orderHistory
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// Create order history (usually called when an order is created)
router.post('/', [
  auth,
  body('orderId').isUUID().withMessage('Valid order ID is required'),
  body('orderNumber').trim().notEmpty().withMessage('Order number is required'),
  body('orderStatus').isIn(['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'])
    .withMessage('Invalid order status'),
  body('paymentStatus').optional().isIn(['pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded'])
    .withMessage('Invalid payment status'),
  body('totalAmount').isDecimal({ decimal_digits: '1,2' }).withMessage('Valid total amount is required'),
  body('currency').optional().isLength({ min: 3, max: 3 }).withMessage('Currency must be 3 characters'),
  body('itemCount').isInt({ min: 1 }).withMessage('Item count must be at least 1'),
  body('shippingAddress').isObject().withMessage('Shipping address is required'),
  body('billingAddress').isObject().withMessage('Billing address is required'),
  body('orderItems').isArray({ min: 1 }).withMessage('Order items are required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    // Verify order belongs to user
    const order = await Order.findOne({
      where: {
        id: req.body.orderId,
        userId: req.user.id
      }
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    const orderHistoryData = {
      ...req.body,
      userId: req.user.id
    };

    const orderHistory = await OrderHistory.create(orderHistoryData);

    res.status(201).json({
      success: true,
      message: 'Order history created successfully',
      orderHistory
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// Update order history (usually for status updates)
router.put('/:id', [
  auth,
  body('orderStatus').optional().isIn(['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'])
    .withMessage('Invalid order status'),
  body('paymentStatus').optional().isIn(['pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded'])
    .withMessage('Invalid payment status'),
  body('trackingNumber').optional().isLength({ max: 100 }).withMessage('Tracking number cannot exceed 100 characters'),
  body('shippingProvider').optional().isLength({ max: 50 }).withMessage('Shipping provider cannot exceed 50 characters'),
  body('notes').optional().isLength({ max: 1000 }).withMessage('Notes cannot exceed 1000 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const orderHistory = await OrderHistory.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });

    if (!orderHistory) {
      return res.status(404).json({
        success: false,
        message: 'Order history not found'
      });
    }

    await orderHistory.update(req.body);

    res.json({
      success: true,
      message: 'Order history updated successfully',
      orderHistory
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// Get orders by status
router.get('/status/:type/:status', [
  auth,
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { type, status } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    let whereClause = { userId: req.user.id };

    if (type === 'order') {
      const validOrderStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'];
      if (!validOrderStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid order status'
        });
      }
      whereClause.orderStatus = status;
    } else if (type === 'payment') {
      const validPaymentStatuses = ['pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded'];
      if (!validPaymentStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid payment status'
        });
      }
      whereClause.paymentStatus = status;
    } else {
      return res.status(400).json({
        success: false,
        message: 'Invalid status type. Use "order" or "payment"'
      });
    }

    const { count, rows } = await OrderHistory.findAndCountAll({
      where: whereClause,
      limit,
      offset,
      order: [['createdAt', 'DESC']]
    });

    const totalPages = Math.ceil(count / limit);

    res.json({
      success: true,
      orderHistory: rows,
      pagination: {
        currentPage: page,
        totalPages,
        totalOrders: count,
        ordersPerPage: limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      },
      count: rows.length,
      filterType: type,
      filterStatus: status
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// Get order summary statistics
router.get('/stats/summary', auth, async (req, res) => {
  try {
    const userId = req.user.id;

    const totalOrders = await OrderHistory.count({
      where: { userId }
    });

    const completedOrders = await OrderHistory.count({
      where: { userId, orderStatus: 'delivered' }
    });

    const pendingOrders = await OrderHistory.count({
      where: { userId, orderStatus: ['pending', 'processing', 'shipped'] }
    });

    const paidOrders = await OrderHistory.count({
      where: { userId, paymentStatus: 'completed' }
    });

    const unpaidOrders = await OrderHistory.count({
      where: { userId, paymentStatus: ['pending', 'processing', 'failed'] }
    });

    const totalSpent = await OrderHistory.sum('totalAmount', {
      where: { userId, paymentStatus: 'completed' }
    }) || 0;

    res.json({
      success: true,
      summary: {
        totalOrders,
        completedOrders,
        pendingOrders,
        paidOrders,
        unpaidOrders,
        totalSpent: parseFloat(totalSpent).toFixed(2),
        currency: 'THB'
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

module.exports = router;