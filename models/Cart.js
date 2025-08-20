const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Cart = sequelize.define('Cart', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    unique: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  totalAmount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
    validate: {
      min: { args: [0], msg: 'Total amount cannot be negative' }
    }
  }
}, {
  hooks: {
    beforeSave: async (cart) => {
      const items = await CartItem.findAll({ where: { cartId: cart.id } });
      cart.totalAmount = items.reduce((total, item) => {
        return total + (parseFloat(item.price) * item.quantity);
      }, 0);
    }
  }
});

const CartItem = sequelize.define('CartItem', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  cartId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'carts',
      key: 'id'
    }
  },
  productId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'products',
      key: 'id'
    }
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: { args: [1], msg: 'Quantity must be at least 1' }
    }
  },
  variant: {
    type: DataTypes.STRING,
    allowNull: true
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: { args: [0], msg: 'Price cannot be negative' }
    }
  },
  totalPrice: {
    type: DataTypes.VIRTUAL,
    get() {
      return parseFloat(this.price) * this.quantity;
    }
  }
});

// Define associations in index.js or after Product is loaded
Cart.hasMany(CartItem, { foreignKey: 'cartId', as: 'items' });
CartItem.belongsTo(Cart, { foreignKey: 'cartId' });

Cart.prototype.calculateTotal = async function() {
  const items = await CartItem.findAll({ where: { cartId: this.id } });
  this.totalAmount = items.reduce((total, item) => {
    return total + (parseFloat(item.price) * item.quantity);
  }, 0);
  await this.save();
  return this.totalAmount;
};

module.exports = { Cart, CartItem };