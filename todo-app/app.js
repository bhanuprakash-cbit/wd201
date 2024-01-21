/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
var cookieParser = require("cookie-parser")
const path = require("path");
var csrf = require("tiny-csrf")
const flash = require("connect-flash");

const passport = require("passport");
const connectEnsureLogin = require("connect-ensure-login");
const session = require("express-session");
const LocalStrategy = require("passport-local");
const bcrypt = require("bcrypt")

const saltRounds = 10

app.use(bodyParser.json());

app.set("view engine", "ejs");

app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser("shh! some secret string"))
app.use(csrf("this_should_be_32_character_long", ["POST", "PUT", "DELETE"]))
//app.use(csrf( { cookie: true }))

app.use(express.static(path.join(__dirname, "public")));

app.use(session({
    secret: "my-super-secret-key-21728172615261562",
    cookie: {
      maxAge: 24 * 60 * 60 * 1000,
    },
  })
);

app.use(flash());

app.use(function(request, response, next) {
  response.locals.messages = request.flash();
  next();
});

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy({
  usernameField: "email",
  passwordField: "password",
},  (username, password, done) => {
  User.findOne({ where: { email: username }})
    .then(async (user) => {
      const result = await bcrypt.compare(password, user.password)
      if (result) {
        return done(null, user);
      } else {
        return done(null, false, { message: "Invalid password" })
      }
    }).catch((err) => {
      return err;
    });
}));

passport.serializeUser((user, done) => {
  console.log("Serializing user in session", user.id);
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findByPk(id)
    .then((user) => {
      done(null, user);
    })
    .catch((err) => {
      done(err, null);
    });
});

const { Todo, User } = require("./models");

app.set("views", path.join(__dirname, "views"))

app.get("/signup", (req, res) => {
  res.render("signup", {
    title: "Signup",
    csrfToken: req.csrfToken(),
  });
});

app.post("/users", async (req, res) => {
  const hashedPwd = await bcrypt.hash(req.body.password, saltRounds)
  console.log(hashedPwd)
  try {
    const user = await User.create({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      password: hashedPwd,
    });
    req.login(user, (err) => {
      if (err) {
        console.log(err)
      }
      res.redirect("/todos");
    })
  } catch (err) {
    console.log(err);
  }
});

app.get("/login", (req,res) => {
  res.render("login", {
    title: "Login",
    csrfToken: req.csrfToken()
  })
})

app.post("/session", passport.authenticate('local', { failureRedirect: "/login", failureFlash: true }), (req,res) => {
  console.log(req.user)
  res.redirect("/todos")
})

app.get("/signout", (req,res,next) => {
  req.logout((err) => {
    if (err) { return next(err) }
    res.redirect("/")
  })
})

app.get("/", async (req, res) => {
  if (req.isAuthenticated()) {
    return res.redirect("/todos")
  } else {
    if (req.accepts("html")) {
      res.render("index", {
        title: "Todo Application",
        csrfToken: req.csrfToken(),
      });
    }
  }
});

app.use(express.static(path.join(__dirname, "public")));

app.get("/todos", connectEnsureLogin.ensureLoggedIn(), async (req, res) => {
  console.log("Processing list of all todos ...");
  const loggedInUser = req.user.id
  const completedTodos = await Todo.completedTodos(loggedInUser);
  const duetoday = await Todo.dueToday(loggedInUser);
  const overdue = await Todo.overdue(loggedInUser);
  const duelater = await Todo.dueLater(loggedInUser);
  if(req.accepts("html")){
    res.render("todos", {
      title: "Todo Application",
      completedTodos,
      duetoday,
      overdue,
      duelater,
      csrfToken: req.csrfToken(),
    });
  } else {
    console.log("Hey there 9")
    console.log(duetoday)
    console.log(res.json(completedTodos,duetoday,overdue,duelater))
    res.json(completedTodos,duetoday,overdue,duelater);
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


app.post("/todos", connectEnsureLogin.ensureLoggedIn(), async (req, res) => {
  console.log("Creating a todo", req.body); 
  try {
    const todo = await Todo.addTodo({
      title: req.body.title,
      dueDate: req.body.dueDate,
      userId: req.user.id
    });
    //return res.json(todo);
    return res.redirect("/todos")
  } catch (err) {
    console.log(err);
    return res.status(422).json(err);
  }
});

app.put("/todos/:id", connectEnsureLogin.ensureLoggedIn(), async (req, res) => {
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

app.delete("/todos/:id", connectEnsureLogin.ensureLoggedIn(), async (req, res) => {
  console.log("jsbndbmvb")
  try {
    const loggedInUser = req.user.id;
    console.log(loggedInUser)
    let res1 = await Todo.remove(req.params.id, loggedInUser);
    if (res1 == 1) {
      console.log("We have deleted todo by ID: ", req.params.id);
      return res.json({ success: true });
    } else {
      console.log(res)
      return res.status(422).json(res);
    }
  } catch (err) {
    console.log(err)
    return res.status(422).json(err);
  }
});

module.exports = app;
