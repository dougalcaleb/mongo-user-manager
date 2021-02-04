const express = require("express");
const mongoose = require("mongoose");
const uuid = require("uuid").v4;
const dbLoc = "mongodb://localhost/userManager";
const bodyParser = require("body-parser");
var urlencodedParser = bodyParser.urlencoded({extended: false});

// const dbLoc = "C:/Users/caleb/OneDrive/Documents/MTEC/Practice/MongoDB/sample data/";

const app = express();
mongoose.connect(dbLoc, { useNewUrlParser: true, useUnifiedTopology: true });
const dbi = mongoose.connection;

app.set("views", "./views");
app.set("view engine", "pug");

const PORT = process.env.PORT || 3001;

const userSchema = new mongoose.Schema({
   userId: String,
   firstName: String,
   lastName: String,
   email: String,
   age: Number
});

const db = mongoose.model("userManager", userSchema);


app.get("/users", (req, res) => {
   let allUsers = db.find({});
   console.log(allUsers);
   res.render("users", { userCount: allUsers.length || 0 });
});

app.get("/", (req, res) => {
   res.render("index");
});

app.get("/addUser", (req, res) => {
   res.render("addUser");
});

app.post("/newUser", urlencodedParser, (req, res) => {
   addNewUser(uuid(), req.body.firstName,req.body.lastName,req.body.email,req.body.age);
   res.send("tanks u");
});

function addNewUser(id = "NO_DATA", firstName = "NO_DATA", lastName = "NO_DATA", email = "NO_DATA", age = 0) {
   db.insertMany({ userId: id, firstName: firstName, lastName: lastName, email: email, age: age });
   console.log("Write complete");
}

// document.querySelector(".fake").addEventListener("click", () => {
//    console.log("Adding junk to db");
//    addNewUser();
// });


app.listen(PORT, () => {
   console.log(`Listening on port ${PORT}`);
});

dbi.on("error", () => {
   console.error.bind(console, "connection error:");
});
dbi.once("open", () => {
   console.log("User Manager DB Connected");
});