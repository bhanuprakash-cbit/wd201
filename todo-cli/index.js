/* eslint-disable no-unused-vars */
const { connect } = require("./connectDB.js");
const Todo = require("./TodoModel.js");

const createTodo = async () => {
  try {
    await connect();
    const todo = await Todo.addTask({
      title: "Third task",
      dueDate: new Date(),
      completed: false,
    });
    console.log(`Created todo with id ${todo.id}`);
  } catch (err) {
    console.log(err);
  }
};

const countItems = async () => {
  try {
    const totalCount = await Todo.count();
    console.log(`Found ${totalCount} items in the table`);
  } catch (err) {
    console.error("Error: ", err);
  }
};

const getAlltodos = async () => {
  try {
    const todos = await Todo
      .findAll
      //     {
      //     order: [
      //         ['id', 'DESC']
      //     ]
      // }
      ();
    const todoList = todos.map((todo) => todo.displayableString()).join("\n");
    console.log(todoList);
  } catch (err) {
    console.error("Error: ", err);
  }
};

const updateTodo = async (id) => {
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
    console.log(err);
  }
};

const deleteTodo = async (id) => {
  try {
    const deletedRow = await Todo.destroy({
      where: {
        id: id,
      },
    });
    console.log(`Deleted row count ${deletedRow}`);
  } catch (err) {
    console.log(err);
  }
};

(async () => {
  // await getAlltodos();
  await createTodo();
  // await countItems();
  await getAlltodos();
  // await updateTodo(2);
  // await deleteTodo(3);
  // await getAlltodos();
})();
