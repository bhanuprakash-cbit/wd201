/* eslint-disable no-unused-vars */
"use strict";
const { Sequelize, Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Todo extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static async addTask(params) {
      return await Todo.create(params);
    }

    static associate(models) {
      // define association here
    }

    static async overdue() {
      try {
        const overdue_todo = await Todo.findAll({
          where: {
            dueDate: { [Sequelize.Op.lt]: new Date() },
          },
          order: [["id", "ASC"]],
        });
        //const displayable_overdue = await overdue_todo.map(todo => todo.displayableString()).join("\n")
        return overdue_todo;
      } catch (err) {
        console.error(err);
      }
    }

    static async dueToday() {
      try {
        const dueToday_todo = await Todo.findAll({
          where: {
            dueDate: { [Sequelize.Op.eq]: new Date() },
          },
          order: [["id", "ASC"]],
        });
        //const displayable_dueToday = await dueToday_todo.map(todo => todo.displayableString()).join("\n")
        return dueToday_todo;
      } catch (err) {
        console.error(err);
      }
    }

    static async dueLater() {
      try {
        const dueLater_todo = await Todo.findAll({
          where: {
            dueDate: { [Sequelize.Op.gt]: new Date() },
          },
          order: [["id", "ASC"]],
        });
        //const displayable_dueLater = await dueLater_todo.map(todo => todo.displayableString()).join("\n")
        return dueLater_todo;
      } catch (err) {
        console.error(err);
      }
    }

    static async markAsComplete(id) {
      try {
        await Todo.update(
          { completed: true },
          {
            where: {
              id: id,
            },
          },
        );
      } catch (err) {
        console.error(err);
      }
    }

    displayableString() {
      const checkbox = this.completed ? "[x]" : "[ ]";
      if (this.dueDate == new Date().toISOString().split("T")[0]) {
        return `${this.id}. ${checkbox} ${this.title}`;
      } else {
        return `${this.id}. ${checkbox} ${this.title} ${this.dueDate}`;
      }
    }

    static async showList() {
      console.log("My Todo-list\n");
      console.log("Overdue");
      const t1 = await this.overdue();
      const displayable_overdue = await t1
        .map((todo) => todo.displayableString())
        .join("\n");
      console.log(displayable_overdue);
      console.log("\nDue Today");
      const t2 = await this.dueToday();
      const displayable_dueToday = await t2
        .map((todo) => todo.displayableString())
        .join("\n");
      console.log(displayable_dueToday);
      console.log("\nDue Later");
      const t3 = await this.dueLater();
      const displayable_dueLater = await t3
        .map((todo) => todo.displayableString())
        .join("\n");
      console.log(displayable_dueLater);
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
