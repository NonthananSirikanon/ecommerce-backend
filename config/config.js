require('dotenv').config();

module.exports = {
  development: {
    url: process.env.DATABASE_URL || 'postgresql://ecommerce_user:ecommerce_password@localhost:5432/ecommerce_db',
    dialect: 'postgres',
    logging: console.log
  },
  test: {
    url: process.env.DATABASE_URL || 'postgresql://ecommerce_user:ecommerce_password@localhost:5432/ecommerce_test_db',
    dialect: 'postgres',
    logging: false
  },
  production: {
    url: process.env.DATABASE_URL,
    dialect: 'postgres',
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    }
  }
};