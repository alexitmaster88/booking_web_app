const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./users');

const Place = sequelize.define('Place', {
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  address: {
    type: DataTypes.STRING,
    allowNull: false
  },
  photos: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: []
  },
  description: {
    type: DataTypes.TEXT
  },
  perks: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: []
  },
  extraInfo: {
    type: DataTypes.TEXT
  },
  checkIn: {
    type: DataTypes.INTEGER
  },
  checkOut: {
    type: DataTypes.INTEGER
  },
  maxGuests: {
    type: DataTypes.INTEGER
  },
  price: {
    type: DataTypes.FLOAT
  },
  startDate: {
    type: DataTypes.DATE
  },
  endDate: {
    type: DataTypes.DATE
  }
}, {
  timestamps: true
});

// Define relationship with User
Place.belongsTo(User, { 
  foreignKey: 'ownerId', // This replaces the owner field in MongoDB
  as: 'owner' // Alias to maintain compatibility with existing code
});

module.exports = Place;