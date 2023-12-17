const Sequelize = require("sequelize");

const db = "todo_db";
const user = "postgres";
const pswd = "postgres";
const sequelize = new Sequelize(db, user, pswd, {
  host: "localhost",
  dialect: "postgres",
  logging: false,
});

const connect = async () => {
  sequelize.authenticate();
};

module.exports = {
  connect,
  sequelize,
};
