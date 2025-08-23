const express = require('express');
const { body, validationResult } = require('express-validator');
const { ShippingAddress } = require('../models');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Get all shipping addresses for the authenticated user
router.get('/', auth, async (req, res) => {
  try {
    const addresses = await ShippingAddress.findAll({
      where: { userId: req.user.id },
      order: [['isDefault', 'DESC'], ['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      addresses,
      count: addresses.length
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

// Get a specific shipping address by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const address = await ShippingAddress.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });

    if (!address) {
      return res.status(404).json({
        success: false,
        message: 'Shipping address not found'
      });
    }

    res.json({
      success: true,
      address
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

// Create a new shipping address
router.post('/', [
  auth,
  body('firstName').trim().notEmpty().withMessage('First name is required')
    .isLength({ max: 50 }).withMessage('First name cannot exceed 50 characters'),
  body('lastName').trim().notEmpty().withMessage('Last name is required')
    .isLength({ max: 50 }).withMessage('Last name cannot exceed 50 characters'),
  body('company').optional().isLength({ max: 100 }).withMessage('Company cannot exceed 100 characters'),
  body('addressLine1').trim().notEmpty().withMessage('Address line 1 is required')
    .isLength({ max: 255 }).withMessage('Address line 1 cannot exceed 255 characters'),
  body('addressLine2').optional().isLength({ max: 255 }).withMessage('Address line 2 cannot exceed 255 characters'),
  body('city').trim().notEmpty().withMessage('City is required')
    .isLength({ max: 100 }).withMessage('City cannot exceed 100 characters'),
  body('state').trim().notEmpty().withMessage('State/Province is required')
    .isLength({ max: 100 }).withMessage('State/Province cannot exceed 100 characters'),
  body('postalCode').trim().notEmpty().withMessage('Postal code is required')
    .isLength({ max: 20 }).withMessage('Postal code cannot exceed 20 characters'),
  body('country').trim().notEmpty().withMessage('Country is required')
    .isLength({ max: 100 }).withMessage('Country cannot exceed 100 characters'),
  body('phone').optional().isLength({ max: 20 }).withMessage('Phone cannot exceed 20 characters'),
  body('addressType').optional().isIn(['home', 'work', 'other']).withMessage('Address type must be home, work, or other'),
  body('nickname').optional().isLength({ max: 50 }).withMessage('Nickname cannot exceed 50 characters'),
  body('isDefault').optional().isBoolean().withMessage('isDefault must be a boolean')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const addressData = {
      ...req.body,
      userId: req.user.id
    };

    const address = await ShippingAddress.create(addressData);

    res.status(201).json({
      success: true,
      message: 'Shipping address created successfully',
      address
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

// Update a shipping address
router.put('/:id', [
  auth,
  body('firstName').optional().trim().notEmpty().withMessage('First name cannot be empty')
    .isLength({ max: 50 }).withMessage('First name cannot exceed 50 characters'),
  body('lastName').optional().trim().notEmpty().withMessage('Last name cannot be empty')
    .isLength({ max: 50 }).withMessage('Last name cannot exceed 50 characters'),
  body('company').optional().isLength({ max: 100 }).withMessage('Company cannot exceed 100 characters'),
  body('addressLine1').optional().trim().notEmpty().withMessage('Address line 1 cannot be empty')
    .isLength({ max: 255 }).withMessage('Address line 1 cannot exceed 255 characters'),
  body('addressLine2').optional().isLength({ max: 255 }).withMessage('Address line 2 cannot exceed 255 characters'),
  body('city').optional().trim().notEmpty().withMessage('City cannot be empty')
    .isLength({ max: 100 }).withMessage('City cannot exceed 100 characters'),
  body('state').optional().trim().notEmpty().withMessage('State/Province cannot be empty')
    .isLength({ max: 100 }).withMessage('State/Province cannot exceed 100 characters'),
  body('postalCode').optional().trim().notEmpty().withMessage('Postal code cannot be empty')
    .isLength({ max: 20 }).withMessage('Postal code cannot exceed 20 characters'),
  body('country').optional().trim().notEmpty().withMessage('Country cannot be empty')
    .isLength({ max: 100 }).withMessage('Country cannot exceed 100 characters'),
  body('phone').optional().isLength({ max: 20 }).withMessage('Phone cannot exceed 20 characters'),
  body('addressType').optional().isIn(['home', 'work', 'other']).withMessage('Address type must be home, work, or other'),
  body('nickname').optional().isLength({ max: 50 }).withMessage('Nickname cannot exceed 50 characters'),
  body('isDefault').optional().isBoolean().withMessage('isDefault must be a boolean')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const address = await ShippingAddress.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });

    if (!address) {
      return res.status(404).json({
        success: false,
        message: 'Shipping address not found'
      });
    }

    await address.update(req.body);

    res.json({
      success: true,
      message: 'Shipping address updated successfully',
      address
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

// Set an address as default
router.put('/:id/set-default', auth, async (req, res) => {
  try {
    const address = await ShippingAddress.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });

    if (!address) {
      return res.status(404).json({
        success: false,
        message: 'Shipping address not found'
      });
    }

    await address.update({ isDefault: true });

    res.json({
      success: true,
      message: 'Address set as default successfully',
      address
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

// Delete a shipping address
router.delete('/:id', auth, async (req, res) => {
  try {
    const address = await ShippingAddress.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });

    if (!address) {
      return res.status(404).json({
        success: false,
        message: 'Shipping address not found'
      });
    }

    // If this is the default address and there are other addresses, set another as default
    if (address.isDefault) {
      const otherAddress = await ShippingAddress.findOne({
        where: {
          userId: req.user.id,
          id: { [require('sequelize').Op.ne]: address.id }
        },
        order: [['createdAt', 'DESC']]
      });

      if (otherAddress) {
        await otherAddress.update({ isDefault: true });
      }
    }

    await address.destroy();

    res.json({
      success: true,
      message: 'Shipping address deleted successfully'
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

// Get default shipping address
router.get('/default/address', auth, async (req, res) => {
  try {
    const address = await ShippingAddress.findOne({
      where: {
        userId: req.user.id,
        isDefault: true
      }
    });

    if (!address) {
      return res.status(404).json({
        success: false,
        message: 'No default shipping address found'
      });
    }

    res.json({
      success: true,
      address
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