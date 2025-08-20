const express = require('express');
const { body, validationResult, query } = require('express-validator');
const { Product } = require('../models');
const { auth, admin } = require('../middleware/auth');

const router = express.Router();

// Get all products with simplified response and pagination
router.get('/', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 1000 }).withMessage('Limit must be between 1 and 1000'),
  query('search').optional().isString().withMessage('Search must be a string')
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
    const limit = parseInt(req.query.limit) || 50; // Increased default limit
    const offset = (page - 1) * limit;
    const search = req.query.search;

    // Build where clause
    let where = { isActive: true };
    
    if (search) {
      const { Op } = require('sequelize');
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const { count, rows: products } = await Product.findAndCountAll({
      where,
      attributes: [
        'id',
        'name', 
        'description',
        'price',
        'image',
        'inventory'
      ],
      order: [['createdAt', 'DESC']],
      limit,
      offset
    });

    // Transform products to include quantity and totalPrice
    const transformedProducts = products.map(product => ({
      id: product.id,
      name: product.name,
      description: product.description,
      price: parseFloat(product.price),
      image: product.image,
      quantity: product.inventory?.quantity || 0,
      totalPrice: parseFloat(product.price) // For individual product, totalPrice = price
    }));

    const totalPages = Math.ceil(count / limit);

    res.json({
      success: true,
      products: transformedProducts,
      pagination: {
        currentPage: page,
        totalPages,
        totalProducts: count,
        productsPerPage: limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      },
      count: transformedProducts.length
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

// Get single product by ID
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id, {
      attributes: [
        'id',
        'name',
        'description', 
        'price',
        'image',
        'inventory'
      ]
    });

    if (!product || !product.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const transformedProduct = {
      id: product.id,
      name: product.name,
      description: product.description,
      price: parseFloat(product.price),
      image: product.image,
      quantity: product.inventory?.quantity || 0,
      totalPrice: parseFloat(product.price)
    };

    res.json({
      success: true,
      product: transformedProduct
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

// Create new product (Admin only)
router.post('/', [
  auth,
  admin,
  body('name').trim().notEmpty().withMessage('Product name is required'),
  body('description').trim().notEmpty().withMessage('Product description is required'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('quantity').isInt({ min: 0 }).withMessage('Quantity must be a non-negative integer'),
  body('image').optional().isString().withMessage('Image must be a string (Base64)')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { name, description, price, quantity, image } = req.body;

    // Create product with inventory
    const product = await Product.create({
      name,
      description,
      price,
      image: image || null,
      categoryId: '00000000-0000-0000-0000-000000000000', // Default category UUID
      inventory: {
        quantity: parseInt(quantity),
        trackInventory: true,
        lowStockThreshold: 10
      },
      isActive: true
    });

    const transformedProduct = {
      id: product.id,
      name: product.name,
      description: product.description,
      price: parseFloat(product.price),
      image: product.image,
      quantity: product.inventory?.quantity || 0,
      totalPrice: parseFloat(product.price)
    };

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      product: transformedProduct
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

// Update product (Admin only)
router.put('/:id', [
  auth,
  admin,
  body('name').optional().trim().notEmpty().withMessage('Product name cannot be empty'),
  body('description').optional().trim().notEmpty().withMessage('Product description cannot be empty'),
  body('price').optional().isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('quantity').optional().isInt({ min: 0 }).withMessage('Quantity must be a non-negative integer'),
  body('image').optional().isString().withMessage('Image must be a string (Base64)')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const { name, description, price, quantity, image } = req.body;
    
    // Update fields if provided
    if (name) product.name = name;
    if (description) product.description = description;
    if (price) product.price = price;
    if (image !== undefined) product.image = image;
    
    if (quantity !== undefined) {
      product.inventory = {
        ...product.inventory,
        quantity: parseInt(quantity)
      };
    }

    await product.save();

    const transformedProduct = {
      id: product.id,
      name: product.name,
      description: product.description,
      price: parseFloat(product.price),
      image: product.image,
      quantity: product.inventory?.quantity || 0,
      totalPrice: parseFloat(product.price)
    };

    res.json({
      success: true,
      message: 'Product updated successfully',
      product: transformedProduct
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

// Delete product (Admin only)
router.delete('/:id', [auth, admin], async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    await product.destroy();

    res.json({
      success: true,
      message: 'Product deleted successfully'
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