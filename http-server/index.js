const http = require("http");
const fs = require("fs");
const args = require("minimist")(process.argv)

let homeFile = "";
let projectFile = "";
let registrationFile = "";

fs.readFile("home.html", (err, data) => {
    if (err) {
        console.error("Error reading home.html:", err);
        throw err;
    }
    homeFile = data;
    console.log("homeFile loaded successfully");
});

fs.readFile("project.html", (err, data) => {
    if (err) {
        console.error("Error reading project.html:", err);
        throw err;
    }
    projectFile = data;
    console.log("projectFile loaded successfully");
});

fs.readFile("registration.html", (err, data) => {
    if (err) {
        console.error("Error reading registration.html:", err);
        throw err;
    }
    registrationFile = data;
    console.log("registrationFile loaded successfully");
});

http.createServer((req, res) => {
    let url = req.url;
    console.log("Requested URL:", url);

    switch (url) {
        case "/project.html":
            console.log("Sending projectFile");
            res.write(projectFile);
            res.end();
            break;
        case "/registration.html":
            console.log("Sending registrationFile");
            res.write(registrationFile);
            res.end();
            break;
        default:
            console.log("Sending homeFile");
            res.write(homeFile);
            res.end();
            break;
    }
}).listen(args["port"], () => {
    console.log("Server running at port",args["port"]);
});
