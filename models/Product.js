const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Product = sequelize.define('Product', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Product name is required' },
      len: { args: [1, 100], msg: 'Product name cannot exceed 100 characters' }
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Product description is required' },
      len: { args: [1, 2000], msg: 'Description cannot exceed 2000 characters' }
    }
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: { args: [0], msg: 'Price cannot be negative' }
    }
  },
  comparePrice: {
    type: DataTypes.DECIMAL(10, 2),
    validate: {
      min: { args: [0], msg: 'Compare price cannot be negative' }
    }
  },
  cost: {
    type: DataTypes.DECIMAL(10, 2),
    validate: {
      min: { args: [0], msg: 'Cost cannot be negative' }
    }
  },
  sku: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: true
  },
  categoryId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'category_id',
    references: {
      model: 'categories',
      key: 'id'
    }
  },
  subcategoryId: {
    type: DataTypes.UUID,
    allowNull: true,
    field: 'subcategory_id',
    references: {
      model: 'categories',
      key: 'id'
    }
  },
  brand: {
    type: DataTypes.STRING,
    allowNull: true
  },
  image: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Base64 encoded image'
  },
  images: {
    type: DataTypes.JSONB,
    defaultValue: [],
    comment: 'Additional images array'
  },
  variants: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  inventory: {
    type: DataTypes.JSONB,
    defaultValue: {
      quantity: 0,
      lowStockThreshold: 10,
      trackInventory: true
    }
  },
  specifications: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  tags: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: []
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'is_active'
  },
  isFeatured: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  weight: {
    type: DataTypes.DECIMAL(8, 2),
    validate: {
      min: { args: [0], msg: 'Weight cannot be negative' }
    }
  },
  dimensions: {
    type: DataTypes.JSONB,
    defaultValue: {}
  },
  seoTitle: {
    type: DataTypes.STRING,
    allowNull: true
  },
  seoDescription: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  averageRating: {
    type: DataTypes.DECIMAL(2, 1),
    defaultValue: 0,
    validate: {
      min: { args: [0], msg: 'Rating cannot be negative' },
      max: { args: [5], msg: 'Rating cannot exceed 5' }
    }
  },
  reviewCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
});

const Review = sequelize.define('Review', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
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
  rating: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: { args: [1], msg: 'Rating must be at least 1' },
      max: { args: [5], msg: 'Rating cannot exceed 5' }
    }
  },
  comment: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Review comment is required' },
      len: { args: [1, 500], msg: 'Review cannot exceed 500 characters' }
    }
  }
});

Product.hasMany(Review, { foreignKey: 'productId', as: 'reviews' });
Review.belongsTo(Product, { foreignKey: 'productId' });

Product.updateRating = async function(productId) {
  const reviews = await Review.findAll({ where: { productId } });
  const product = await Product.findByPk(productId);
  
  if (reviews.length === 0) {
    product.averageRating = 0;
    product.reviewCount = 0;
  } else {
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    product.averageRating = Math.round((totalRating / reviews.length) * 10) / 10;
    product.reviewCount = reviews.length;
  }
  
  await product.save();
};

module.exports = { Product, Review };