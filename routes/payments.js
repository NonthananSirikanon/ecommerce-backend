const express = require('express');
const { body, validationResult } = require('express-validator');
const { Payment, Order } = require('../models');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Get all payments for the authenticated user
router.get('/', auth, async (req, res) => {
  try {
    const payments = await Payment.findAll({
      where: { userId: req.user.id },
      include: [{
        model: Order,
        as: 'order',
        attributes: ['id', 'total_price', 'status']
      }],
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      payments,
      count: payments.length
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

// Get a specific payment by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const payment = await Payment.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id
      },
      include: [{
        model: Order,
        as: 'order',
        attributes: ['id', 'total_price', 'status']
      }]
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    res.json({
      success: true,
      payment
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

// Create a new payment
router.post('/', [
  auth,
  body('orderId').isUUID().withMessage('Valid order ID is required'),
  body('amount').isDecimal({ decimal_digits: '1,2' }).withMessage('Valid amount is required'),
  body('currency').optional().isLength({ min: 3, max: 3 }).withMessage('Currency must be 3 characters'),
  body('paymentMethod').isIn(['credit_card', 'debit_card', 'bank_transfer', 'cash', 'digital_wallet'])
    .withMessage('Invalid payment method'),
  body('transactionId').optional().isLength({ max: 100 }).withMessage('Transaction ID cannot exceed 100 characters'),
  body('paymentProvider').optional().isLength({ max: 50 }).withMessage('Payment provider cannot exceed 50 characters')
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

    const paymentData = {
      ...req.body,
      userId: req.user.id
    };

    const payment = await Payment.create(paymentData);

    res.status(201).json({
      success: true,
      message: 'Payment created successfully',
      payment
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

// Update payment status
router.put('/:id/status', [
  auth,
  body('paymentStatus').isIn(['pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded'])
    .withMessage('Invalid payment status'),
  body('transactionId').optional().isLength({ max: 100 }).withMessage('Transaction ID cannot exceed 100 characters'),
  body('failureReason').optional().isLength({ max: 1000 }).withMessage('Failure reason cannot exceed 1000 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const payment = await Payment.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    await payment.update(req.body);

    res.json({
      success: true,
      message: 'Payment status updated successfully',
      payment
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

// Get payments by status
router.get('/status/:status', auth, async (req, res) => {
  try {
    const validStatuses = ['pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded'];
    
    if (!validStatuses.includes(req.params.status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment status'
      });
    }

    const payments = await Payment.findAll({
      where: {
        userId: req.user.id,
        paymentStatus: req.params.status
      },
      include: [{
        model: Order,
        as: 'order',
        attributes: ['id', 'total_price', 'status']
      }],
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      payments,
      count: payments.length,
      status: req.params.status
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

// Delete a payment (only if status is pending or failed)
router.delete('/:id', auth, async (req, res) => {
  try {
    const payment = await Payment.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    // Only allow deletion of pending or failed payments
    if (!['pending', 'failed'].includes(payment.paymentStatus)) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete payment with current status'
      });
    }

    await payment.destroy();

    res.json({
      success: true,
      message: 'Payment deleted successfully'
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