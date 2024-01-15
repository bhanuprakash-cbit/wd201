/* eslint-disable no-undef */
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
app.use(bodyParser.json());
const path = require("path");

const { Todo } = require("./models");

app.set("view engine", "ejs");

app.get("/", async (req, res) => {
  const allTodos = await Todo.getTodos();
  if (req.accepts("html")) {
    res.render("index", { allTodos });
  } else {
    res.json({ allTodos });
  }
});

app.use(express.static(path.join(__dirname, "public")));

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
