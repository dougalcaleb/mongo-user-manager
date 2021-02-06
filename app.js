// PORTS AND LINKS AND SUCH
//======================================================
const dbLoc = "mongodb://localhost/userManager";
const PORT = process.env.PORT || 3001;
//======================================================


const express = require("express");
const mongoose = require("mongoose");
const uuid = require("uuid").v4;
const bodyParser = require("body-parser");
var urlencodedParser = bodyParser.urlencoded({extended: false});
const app = express();
mongoose.connect(dbLoc, { useNewUrlParser: true, useUnifiedTopology: true });
const dbi = mongoose.connection;

let activeData = [];
let editing;

app.set("views", "./views");
app.set("view engine", "pug");
app.use(express.static("public"));

const userSchema = new mongoose.Schema({
   userId: String,
   firstName: String,
   lastName: String,
   email: String,
   age: Number
});

const db = mongoose.model("userManager", userSchema);


app.get("/users/:query*?", (req, res) => {
   let q = {};
   if (req.params.query) {
      q = JSON.parse(req.params.query);
   }
   console.log(`Query is ${q}`);
   db.find(q, (err, data) => {
      if (err) throw err;
      activeData = data;
      res.render("users", { users: data, userCount: data.length || 0 });
   });
});

app.get("/", (req, res) => {
   res.render("index");
});

app.get("/addUser", (req, res) => {
   res.render("addUser");
});

app.get("/search", (req, res) => {
   res.render("search");
});

app.post("/sort", urlencodedParser, (req, res) => {
   let type = req.body.type;
   let order = req.body.order;
   db.find({}, (e, data) => {
      res.render("users", { users: data, userCount: data.length || 0 });
   }).sort(order + "" + type);
});

app.post("/newUser", urlencodedParser, (req, res) => {
   addNewUser(uuid(), req.body.firstName, req.body.lastName, req.body.email, req.body.age, res);
});

async function addNewUser(id = "NO_DATA", firstName = "NO_DATA", lastName = "NO_DATA", email = "NO_DATA", age = 0, res = null) {
   db.insertMany({ userId: id, firstName: firstName, lastName: lastName, email: email, age: age }, () => {
      if (res) {
         updateUsers(res);
      }
   });
}

app.get("/edit/:uid", (req, res) => {
   db.find({ userId: req.params.uid }, (e, data) => {
      editing = req.params.uid;
      res.render("editUser", data[0]);
   });
});

app.post("/editExisting", urlencodedParser, (req, res) => {
   let updatedUser = {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      age: req.body.age
   };
   db.findOneAndUpdate({ userId: editing }, updatedUser, (e) => {
      if (e) console.log(e);
      updateUsers(res);
   });
});

app.get("/delete/:uid", (req, res) => {
   db.find({ userId: req.params.uid }, (e, data) => { })
      .deleteOne({ userId: req.params.uid }, (e, result) => {
      updateUsers(res);
   });
});

app.post("/search", urlencodedParser, (req, res) => {
   let filter = {};
   if (req.body.firstName) {
      filter["firstName"] = req.body.firstName;
   }
   if (req.body.lastName) {
      filter["lastName"] = req.body.lastName;
   }
   console.log(filter);
   db.find(filter, (e, data) => {
      res.render("users", {users: data, userCount: data.length || 0});
   });
});

async function updateUsers(res) {
   db.find({}, (e, data) => {
      res.render("users", {users: data, userCount: data.length || 0});
   });
}


app.listen(PORT, () => {
   console.log(`Listening on port ${PORT}`);
});

dbi.on("error", () => {
   console.error.bind(console, "connection error:");
});
dbi.once("open", () => {
   console.log("User Manager DB Connected");
});