/* eslint-disable no-unused-vars */
"use strict";
const { Model,Op, where } = require("sequelize");
//const { Sequelize } = require(".");
module.exports = (sequelize, DataTypes) => {
  class Todo extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Todo.belongsTo(models.User, {
        foreignKey: 'userId'
      })
    }
    static getTodos() {
      return this.findAll({
        where: {
          userId,
        }
    });
    }
    static addTodo({ title, dueDate, userId }) {
      return this.create({ title: title, dueDate: dueDate, completed: false, userId });
    }
    setCompletionStatus(val) {
      console.log(val)
      return this.update({ completed: val });
    }

    static async remove(id, userId) {
      return this.destroy({
        where: {
          id,
          userId: userId,
        }
      })
    }
    
    static async dueToday (userId) {
      return this.findAll({
        where: {
          dueDate: { [Op.eq]: new Date().toISOString().split("T")[0] },
          userId,
          completed: false
        },
        order: [["id", "ASC"]],
      })
    }
    static async overdue (userId) {
      return this.findAll({
        where: {
          dueDate: { [Op.lt]: new Date().toISOString().split("T")[0] },
          userId,
          completed: false
        },
        order: [["id", "ASC"]],
      })
    }
    static async dueLater (userId) {
      return this.findAll({
        where: {
          dueDate: { [Op.gt]: new Date().toISOString().split("T")[0] },
          userId,
          completed: false
        },
        order: [["id", "ASC"]],
      })
    }
    static async completedTodos (userId) {
      return this.findAll({
        where: {
          userId,
          completed: true
        }
      })
    }
  }
  Todo.init(
    {
      title: DataTypes.STRING,
      dueDate: DataTypes.DATEONLY,
      completed: DataTypes.BOOLEAN,
    },
    {
      sequelize,
      modelName: "Todo",
    },
  );
  return Todo;
};
