const express = require('express');
const { body, validationResult } = require('express-validator');
const { sequelize } = require('../config/database');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Get all orders for authenticated user
router.get('/', auth, async (req, res) => {
  try {
    const [orders] = await sequelize.query(`
      SELECT * FROM orders 
      WHERE user_id = :userId 
      ORDER BY created_at DESC
    `, {
      replacements: { userId: req.user.id },
      type: sequelize.QueryTypes.SELECT
    });

    res.json({
      success: true,
      orders: orders || [],
      count: orders ? orders.length : 0
    });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// Get specific order by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const [order] = await sequelize.query(`
      SELECT * FROM orders 
      WHERE id = :orderId AND user_id = :userId
    `, {
      replacements: { 
        orderId: req.params.id,
        userId: req.user.id 
      },
      type: sequelize.QueryTypes.SELECT
    });

    if (!order.length) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.json({
      success: true,
      order: order[0]
    });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// Create new order (Fallback mechanism)
router.post('/', [
  auth,
  body('shippingAddress').isObject().withMessage('Shipping address is required'),
  body('shippingAddress.firstName').trim().notEmpty().withMessage('First name is required'),
  body('shippingAddress.lastName').trim().notEmpty().withMessage('Last name is required'),
  body('shippingAddress.address').trim().notEmpty().withMessage('Address is required'),
  body('shippingAddress.city').trim().notEmpty().withMessage('City is required'),
  body('paymentMethod').isIn(['credit_card', 'debit_card', 'bank_transfer', 'cash', 'digital_wallet'])
    .withMessage('Invalid payment method'),
  body('items').optional().isArray().withMessage('Items must be an array'),
  body('totalAmount').optional().isDecimal({ decimal_digits: '1,2' }).withMessage('Valid total amount required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { shippingAddress, paymentMethod, items = [], totalAmount = 0 } = req.body;

    // Generate order number
    const timestamp = Date.now();
    const orderNumber = `ORD-${timestamp}`;

    // Create order using raw SQL for fallback
    const orderId = require('uuid').v4();
    
    const [result] = await sequelize.query(`
      INSERT INTO orders (
        id, 
        order_number, 
        user_id, 
        shipping_address, 
        billing_address, 
        payment_info,
        items_price,
        tax_price,
        shipping_price,
        discount_amount,
        total_price,
        status,
        created_at,
        updated_at
      ) VALUES (
        :id,
        :orderNumber,
        :userId,
        :shippingAddress,
        :billingAddress,
        :paymentInfo,
        :itemsPrice,
        :taxPrice,
        :shippingPrice,
        :discountAmount,
        :totalPrice,
        :status,
        NOW(),
        NOW()
      )
    `, {
      replacements: {
        id: orderId,
        orderNumber: orderNumber,
        userId: req.user.id,
        shippingAddress: JSON.stringify(shippingAddress),
        billingAddress: JSON.stringify(shippingAddress), // Use same as shipping for fallback
        paymentInfo: JSON.stringify({ method: paymentMethod }),
        itemsPrice: totalAmount,
        taxPrice: 0,
        shippingPrice: 0,
        discountAmount: 0,
        totalPrice: totalAmount,
        status: 'pending'
      },
      type: sequelize.QueryTypes.INSERT
    });

    // Get the created order
    const [createdOrder] = await sequelize.query(`
      SELECT * FROM orders WHERE id = :orderId
    `, {
      replacements: { orderId: orderId },
      type: sequelize.QueryTypes.SELECT
    });

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      order: {
        id: orderId,
        orderNumber: orderNumber,
        userId: req.user.id,
        shippingAddress: shippingAddress,
        paymentMethod: paymentMethod,
        totalPrice: totalAmount,
        status: 'pending',
        items: items,
        createdAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// Update order status (for internal use)
router.put('/:id/status', [
  auth,
  body('status').isIn(['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'])
    .withMessage('Invalid status')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const [result] = await sequelize.query(`
      UPDATE orders 
      SET status = :status, updated_at = NOW()
      WHERE id = :orderId AND user_id = :userId
    `, {
      replacements: {
        status: req.body.status,
        orderId: req.params.id,
        userId: req.user.id
      },
      type: sequelize.QueryTypes.UPDATE
    });

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.json({
      success: true,
      message: 'Order status updated successfully'
    });
  } catch (error) {
    console.error('Update order error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

module.exports = router;