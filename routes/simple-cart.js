const express = require('express');
const { body, validationResult } = require('express-validator');
const { Cart, CartItem, Product } = require('../models');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Get user's cart with all items
router.get('/', auth, async (req, res) => {
  try {
    let cart = await Cart.findOne({
      where: { userId: req.user.id },
      include: [{
        model: CartItem,
        as: 'items',
        include: [{
          model: Product,
          as: 'product',
          attributes: ['id', 'name', 'description', 'price', 'image', 'inventory']
        }]
      }]
    });

    if (!cart) {
      cart = await Cart.create({ userId: req.user.id });
      cart.items = [];
    }

    const transformedItems = cart.items.map(item => ({
      id: item.id,
      productId: item.productId,
      productName: item.product?.name,
      productDescription: item.product?.description,
      productImage: item.product?.image,
      price: parseFloat(item.price),
      quantity: item.quantity,
      totalPrice: parseFloat(item.price) * item.quantity,
      variant: item.variant
    }));

    const cartTotal = transformedItems.reduce((sum, item) => sum + item.totalPrice, 0);

    res.json({
      success: true,
      cart: {
        id: cart.id,
        userId: cart.userId,
        items: transformedItems,
        totalAmount: cartTotal,
        itemCount: transformedItems.length
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

router.post('/add', [
  auth,
  body('productId').isUUID().withMessage('Valid product ID is required'),
  body('quantity').isInt({ min: 1 }).withMessage('Quantity must be a positive integer'),
  body('variant').optional().isString().withMessage('Variant must be a string')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { productId, quantity, variant } = req.body;

    const product = await Product.findByPk(productId);
    if (!product || !product.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Product not found or unavailable'
      });
    }

    if (product.inventory?.trackInventory && product.inventory?.quantity < quantity) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient inventory',
        availableQuantity: product.inventory?.quantity || 0
      });
    }

    let cart = await Cart.findOne({ where: { userId: req.user.id } });
    if (!cart) {
      cart = await Cart.create({ userId: req.user.id });
    }

    let cartItem = await CartItem.findOne({
      where: {
        cartId: cart.id,
        productId: productId,
        variant: variant || null
      }
    });

    if (cartItem) {
      cartItem.quantity += quantity;
      await cartItem.save();
    } else {
      cartItem = await CartItem.create({
        cartId: cart.id,
        productId: productId,
        quantity: quantity,
        price: product.price,
        variant: variant || null
      });
    }

    await cart.calculateTotal();

    const itemWithProduct = await CartItem.findByPk(cartItem.id, {
      include: [{
        model: Product,
        as: 'product',
        attributes: ['id', 'name', 'description', 'price', 'image']
      }]
    });

    const transformedItem = {
      id: itemWithProduct.id,
      productId: itemWithProduct.productId,
      productName: itemWithProduct.product?.name,
      productDescription: itemWithProduct.product?.description,
      productImage: itemWithProduct.product?.image,
      price: parseFloat(itemWithProduct.price),
      quantity: itemWithProduct.quantity,
      totalPrice: parseFloat(itemWithProduct.price) * itemWithProduct.quantity,
      variant: itemWithProduct.variant
    };

    res.status(201).json({
      success: true,
      message: 'Product added to cart successfully',
      item: transformedItem,
      cartTotal: parseFloat(cart.totalAmount)
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

router.put('/items/:itemId', [
  auth,
  body('quantity').isInt({ min: 1 }).withMessage('Quantity must be a positive integer')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { quantity } = req.body;
    const { itemId } = req.params;

    const cartItem = await CartItem.findOne({
      where: { id: itemId },
      include: [{
        model: Cart,
        where: { userId: req.user.id }
      }, {
        model: Product,
        as: 'product',
        attributes: ['id', 'name', 'description', 'price', 'image', 'inventory']
      }]
    });

    if (!cartItem) {
      return res.status(404).json({
        success: false,
        message: 'Cart item not found'
      });
    }

    if (cartItem.product?.inventory?.trackInventory && 
        cartItem.product?.inventory?.quantity < quantity) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient inventory',
        availableQuantity: cartItem.product?.inventory?.quantity || 0
      });
    }

    cartItem.quantity = quantity;
    await cartItem.save();

    const cart = await Cart.findByPk(cartItem.cartId);
    await cart.calculateTotal();

    const transformedItem = {
      id: cartItem.id,
      productId: cartItem.productId,
      productName: cartItem.product?.name,
      productDescription: cartItem.product?.description,
      productImage: cartItem.product?.image,
      price: parseFloat(cartItem.price),
      quantity: cartItem.quantity,
      totalPrice: parseFloat(cartItem.price) * cartItem.quantity,
      variant: cartItem.variant
    };

    res.json({
      success: true,
      message: 'Cart item updated successfully',
      item: transformedItem,
      cartTotal: parseFloat(cart.totalAmount)
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

router.delete('/items/:itemId', auth, async (req, res) => {
  try {
    const { itemId } = req.params;

    const cartItem = await CartItem.findOne({
      where: { id: itemId },
      include: [{
        model: Cart,
        where: { userId: req.user.id }
      }]
    });

    if (!cartItem) {
      return res.status(404).json({
        success: false,
        message: 'Cart item not found'
      });
    }

    const cartId = cartItem.cartId;
    await cartItem.destroy();

    const cart = await Cart.findByPk(cartId);
    await cart.calculateTotal();

    res.json({
      success: true,
      message: 'Item removed from cart successfully',
      cartTotal: parseFloat(cart.totalAmount)
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

router.delete('/clear', auth, async (req, res) => {
  try {
    const cart = await Cart.findOne({ where: { userId: req.user.id } });
    
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }

    await CartItem.destroy({ where: { cartId: cart.id } });
    
    cart.totalAmount = 0;
    await cart.save();

    res.json({
      success: true,
      message: 'Cart cleared successfully'
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