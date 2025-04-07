"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      // You can add associations here later if needed
    }
  }
  
  User.init(
    {
      username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true
        }
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      totalPoints: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: false
      },
      pointsPerClick: {
        type: DataTypes.INTEGER,
        defaultValue: 1,
        allowNull: false
      },
      pointsPerSecond: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: false
      },
      lastActiveAt: {
        type: DataTypes.DATE,
        allowNull: true
      }
    },
    {
      sequelize,
      modelName: "User",
    }
  );

  return User;
};