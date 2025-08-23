const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ShippingAddress = sequelize.define('ShippingAddress', {
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
  firstName: {
    type: DataTypes.STRING(50),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'First name is required' },
      len: { args: [1, 50], msg: 'First name cannot exceed 50 characters' }
    }
  },
  lastName: {
    type: DataTypes.STRING(50),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Last name is required' },
      len: { args: [1, 50], msg: 'Last name cannot exceed 50 characters' }
    }
  },
  company: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  addressLine1: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Address line 1 is required' },
      len: { args: [1, 255], msg: 'Address line 1 cannot exceed 255 characters' }
    }
  },
  addressLine2: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  city: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'City is required' },
      len: { args: [1, 100], msg: 'City cannot exceed 100 characters' }
    }
  },
  state: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'State/Province is required' },
      len: { args: [1, 100], msg: 'State/Province cannot exceed 100 characters' }
    }
  },
  postalCode: {
    type: DataTypes.STRING(20),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Postal code is required' },
      len: { args: [1, 20], msg: 'Postal code cannot exceed 20 characters' }
    }
  },
  country: {
    type: DataTypes.STRING(100),
    allowNull: false,
    defaultValue: 'Thailand',
    validate: {
      notEmpty: { msg: 'Country is required' },
      len: { args: [1, 100], msg: 'Country cannot exceed 100 characters' }
    }
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: true,
    validate: {
      len: { args: [0, 20], msg: 'Phone number cannot exceed 20 characters' }
    }
  },
  isDefault: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  addressType: {
    type: DataTypes.ENUM('home', 'work', 'other'),
    defaultValue: 'home'
  },
  nickname: {
    type: DataTypes.STRING(50),
    allowNull: true,
    validate: {
      len: { args: [0, 50], msg: 'Nickname cannot exceed 50 characters' }
    }
  }
}, {
  underscored: true,
  hooks: {
    beforeCreate: async (address) => {
      if (address.isDefault) {
        await ShippingAddress.update(
          { isDefault: false },
          { where: { userId: address.userId } }
        );
      }
    },
    beforeUpdate: async (address) => {
      if (address.isDefault && address.changed('isDefault')) {
        await ShippingAddress.update(
          { isDefault: false },
          { where: { userId: address.userId, id: { [require('sequelize').Op.ne]: address.id } } }
        );
      }
    }
  },
  indexes: [
    { fields: ['user_id'] },
    { fields: ['user_id', 'is_default'] },
    { fields: ['country'] }
  ]
});

module.exports = ShippingAddress;