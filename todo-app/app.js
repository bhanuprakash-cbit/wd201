const express = require("express");
const app = express();
const bodyParser = require("body-parser");
app.use(bodyParser.json());

const { Todo } = require("./models");

app.get("/", (req, res) => {
  res.send("Hello world");
});

app.get("/todos", async (req, res) => {
  console.log("Processing list of all todos ...");
  try {
    const todos = await Todo.findAll();
    console.log(todos);
    return res.send(todos);
  } catch (err) {
    console.log(err);
    return res.status(422).json(err);
  }
});

app.get("/todos/:id", async function (request, response) {
  try {
    const todo = await Todo.findByPk(request.params.id);
    return response.json(todo);
  } catch (error) {
    console.log(error);
    return response.status(422).json(error);
  }
});

app.post("/todos", async (req, res) => {
  console.log("Creating a todo", req.body);
  try {
    const todo = await Todo.addTodo({
      title: req.body.title,
      dueDate: req.body.dueDate,
    });
    return res.json(todo);
  } catch (err) {
    console.log(err);
    return res.status(422).json(err);
  }
});

app.put("/todos/:id/markAsCompleted", async (req, res) => {
  console.log("Updating todo with ID: ", req.params.id);
  const todo = await Todo.findByPk(req.params.id);
  try {
    const updatedTodo = await todo.markAsCompleted();
    return res.json(updatedTodo);
  } catch (err) {
    console.log(err);
    return res.status(422).json(err);
  }
});

app.delete("/todos/:id", async (req, res) => {
  console.log("We have deleted todo by ID: ", req.params.id);
  const todo = await Todo.findByPk(req.params.id);
  try {
    if (!todo) {
      return res.send(false);
    }
    todo.destroy();
    return res.send(true);
  } catch (err) {
    console.log(err);
    return res.status(422).json(err);
  }
});

module.exports = app;
