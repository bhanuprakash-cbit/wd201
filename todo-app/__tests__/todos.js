/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
const request = require("supertest");
var cheerio = require("cheerio")

const db = require("../models/index");
const app = require("../app");

let server, agent;
function extractCsrfToken (res) {
  var $ = cheerio.load(res.text)
  return $("[name=_csrf]").val()
}

const login = async (agent, username, password) => {
  let res = await agent.get("/login")
  let csrfToken = extractCsrfToken(res)
  res = await agent.post("/session").send({
    email: username,
    password: password,
    _csrf: csrfToken,
  })
}

describe("Todo Application", function () {
  beforeAll(async () => {
    await db.sequelize.sync({ force: true });
    server = app.listen(4000, () => {});
    agent = request.agent(server);
  });

  afterAll(async () => {
    try {
      await db.sequelize.close();
      await server.close();
    } catch (error) {
      console.log(error);
    }
  });

  test("Sign up", async () => {
    let res = await agent.get("/signup")
    const csrfToken = extractCsrfToken(res)
    res = await agent.post("/users").send({
      firstName: "Test",
      lastName: "User A",
      email: "user.a@test.com",
      password: "12345678",
      _csrf: csrfToken,
    })
    expect(res.statusCode).toBe(302)
  })

  test("Sign out", async () => {
    let res = await agent.get("/todos")
    expect(res.statusCode).toBe(200)
    res = await agent.get("/signout")
    expect(res.statusCode).toBe(302)
    res = await agent.get("/todos")
    expect(res.statusCode).toBe(302)
  })

  test("Creates a new todo", async () => {
    const agent = request.agent(server)
    await login(agent, "user.a@test.com", "12345678")
    const res = await agent.get("/todos")
    const csrfToken = extractCsrfToken(res)
    const response = await agent.post("/todos").send({
      title: "Buy milk",
      dueDate: new Date().toISOString(),
      completed: false,
      "_csrf": csrfToken,
    });
    expect(response.statusCode).toBe(302);
  });

  // test("Marks a todo with the given ID as complete", async () => {
  //   const agent = request.agent(server)
  //   await login(agent, "user.a@test.com", "12345678")
  //   let res = await agent.get("/todos")
  //   let csrfToken = extractCsrfToken(res)
  //   const response5 = await agent.post("/todos").send({
  //     title: "Buy milk",
  //     dueDate: new Date().toISOString(),
  //     completed: false,
  //     _csrf: csrfToken,
  //   });
  //   console.log(response5)
  //   const groupedTodosResponse = await agent.get("/todos").set("Accept", "application/json")
  //   console.log("Hey there 1")
  //   //console.log(groupedTodosResponse)
  //   const parsedGroupedResponse = JSON.parse(groupedTodosResponse.text)
  //   console.log("Hey there 2")
  //   console.log(parsedGroupedResponse)
  //   const dueTodayCount = parsedGroupedResponse.duetoday.length
  //   const latestTodo = parsedGroupedResponse.duetoday[dueTodayCount - 1]

  //   res = await agent.get("/todos")
  //   csrfToken = extractCsrfToken(res)

  //   const markCompleteResponse = await agent.put(`/todos/${latestTodo.id}`).send({
  //       _csrf: csrfToken,
  //     });
  //   const parsedUpdateResponse = JSON.parse(markCompleteResponse.text);
  //   expect(parsedUpdateResponse.completed).toBe(true);
  // });

  // test("Fetches all todos in the database using /todos endpoint", async () => {
  //   await agent.post("/todos").send({
  //     title: "Buy xbox",
  //     dueDate: new Date().toISOString(),
  //     completed: false,
  //   });
  //   await agent.post("/todos").send({
  //     title: "Buy ps3",
  //     dueDate: new Date().toISOString(),
  //     completed: false,
  //   });
  //   const response = await agent.get("/todos");
  //   const parsedResponse = JSON.parse(response.text);

  //   expect(parsedResponse.length).toBe(4);
  //   expect(parsedResponse[3]["title"]).toBe("Buy ps3");
  // });

  // test("Deletes a todo with the given ID if it exists and sends a boolean response", async () => {
  //   const agent = request.agent(server)
  //   await login(agent, "user.a@test.com", "12345678")
  //   let res = await agent.get("/todos");
  //   let csrfToken = extractCsrfToken()
  //   await agent.post("/todos").send({
  //     title: "Buy milk",
  //     dueDate: new Date().toISOString(),
  //     completed: false,
  //     _csrf: csrfToken,
  //   });

  //   const groupedTodosResponse = await agent.get("/todos").set("Accept", "application/json")
  //   const parsedGroupedResponse = JSON.parse(groupedTodosResponse.text);
    
  //   expect(parsedGroupedResponse.duetoday).toBeDefined()

  //   const dueTodayCount = parsedGroupedResponse.duetoday.length
  //   const latestTodo = parsedGroupedResponse.duetoday[dueTodayCount - 1]

  //   res = await agent.get("/todos")
  //   csrfToken = extractCsrfToken(res)

  //   const deletedResponse = await agent.delete(`/todos/${latestTodo.id}`).send({
  //     _csrf: csrfToken,
  //   })
  //   expect(deletedResponse.statusCode).toBe(200)
  // });
});
