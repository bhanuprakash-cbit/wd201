/* eslint-disable no-unused-vars */
"use strict";
const { Model,Op } = require("sequelize");
//const { Sequelize } = require(".");
module.exports = (sequelize, DataTypes) => {
  class Todo extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
    static getTodos() {
      return this.findAll();
    }
    static addTodo({ title, dueDate }) {
      return this.create({ title: title, dueDate: dueDate, completed: false });
    }
    markAsCompleted() {
      return this.update({ completed: true });
    }

    static async remove(id) {
      return this.destroy({
        where: {
          id,
        }
      })
    }
    
    static async dueToday () {
      return this.findAll({
        where: {
          dueDate: { [Op.eq]: new Date().toISOString().split("T")[0] },
          completed: false,
        },
        order: [["id", "ASC"]],
      })
    }
    static async overdue () {
      return this.findAll({
        where: {
          dueDate: { [Op.lt]: new Date().toISOString().split("T")[0] },
          completed: false,
        },
        order: [["id", "ASC"]],
      })
    }
    static async dueLater () {
      return this.findAll({
        where: {
          dueDate: { [Op.gt]: new Date().toISOString().split("T")[0] },
          completed: false,
        },
        order: [["id", "ASC"]],
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
