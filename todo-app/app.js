/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
const express = require("express");
const app = express();
var csrf = require("csurf")
var cookieParser = require("cookie-parser")
const bodyParser = require("body-parser");
app.use(bodyParser.json());
app.use(cookieParser("shh! some secret string"))
// app.use(csrf("this_should_be_32_character_long", ["POST", "PUT", "DELETE"]))
app.use(csrf( { cookie: true }))
const path = require("path");
app.use(express.urlencoded({ extended: false }))

const { Todo } = require("./models");
app.set("views", path.join(__dirname, "views"))
app.set("view engine", "ejs");

app.get("/", async (req, res) => {
  const completedTodos = await Todo.completedTodos();
  const duetoday = await Todo.dueToday();
  const overdue = await Todo.overdue();
  const duelater = await Todo.dueLater();
  const csrfToken = await req.csrfToken()
  if(req.accepts("html")){ 
    res.render("index", {
      completedTodos,
      duetoday,
      overdue,
      duelater,
      csrfToken,
    });
    console.log(csrfToken)
  } else {
    res.json({completedTodos,duetoday,overdue,duelater});
  }
  // if (req.accepts("html")) {
  //   const alltodos = await Todo.getTodos();
  //   res.render("index", { alltodos });
  // } else {
  //   res.json({ alltodos });
  // }
});

app.use(express.static(path.join(__dirname, "public")));

app.get("/todos", async (req, res) => {
  console.log("Processing list of all todos ...");
  if(req.accepts("html")){
    const completedTodos = await Todo.completedTodos();
    const duetoday = await Todo.dueToday();
    const overdue = await Todo.overdue();
    const duelater = await Todo.dueLater();
    res.render("index", {
      completedTodos,
      duetoday,
      overdue,
      duelater,
      csrfToken: req.csrfToken(),
    });
  } else {
    res.json(completedTodos,duetoday,overdue,duelater);
  }
  // try {
  //   const todos = await Todo.findAll();
  //   console.log(todos);
  //   return res.send(todos);
  // } catch (err) {
  //   console.log(err);
  //   return res.status(422).json(err);
  // }
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
    //return res.json(todo);
    return res.redirect("/todos")
  } catch (err) {
    console.log(err);
    return res.status(422).json(err);
  }
});

app.put("/todos/:id", async (req, res) => {
  console.log("Updating todo with ID: ", req.params.id);
  const todo = await Todo.findByPk(req.params.id);
  try {
    const updatedTodo = await todo.setCompletionStatus(!(todo.completed));
    console.log(todo.completed)
    return res.json(updatedTodo);
  } catch (err) {
    console.log(err);
    return res.status(422).json(err);
  }
});

app.delete("/todos/:id", async (req, res) => {
  console.log("We have deleted todo by ID: ", req.params.id);
  // const todo = await Todo.findByPk(req.params.id);
  // try {
  //   if (!todo) {
  //     return res.send(false);
  //   }
  //   todo.destroy();
  //   return res.send(true);
  // } catch (err) {
  //   console.log(err);
  //   return res.status(422).json(err);
  // }
  try {
    await Todo.remove(req.params.id)
    return res.json({ success: true })
  } catch (err) {
    return res.status(422).json(err)
  }
});

module.exports = app;
