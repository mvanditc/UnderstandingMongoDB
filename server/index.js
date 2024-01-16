const express = require('express');
const mongoose =require('mongoose')

const app = express();
const port = 3000;

const server = '127.0.0.1:27017'; 
const database = 'admin'; 
class Database {
  constructor() {
    this._connect();
  }
  _connect() {
    mongoose
      .connect(`mongodb://${server}/${database}`)
      .then(() => {
        console.log('Database connection successful');
      })
      .catch((err) => {
        console.error('Database connection failed');
      });
  }
}

module.exports = new Database();

const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    age: Number,
});

const User = mongoose.model('User', userSchema);
const newUser = new User({
  name: 'Elena John',
  email: 'elena.john@example.com',
  age: 22,
});

newUser.save()
.then(() => {
  console.log('Save User at MongoDB');
})
.catch((error) => {
  console.error(error);
});

const bodyParser = require('body-parser');

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

app.use(bodyParser.json());

const fs = require('fs');

const rawData = fs.readFileSync('employees.json');
const jsonData = JSON.parse(rawData);

const employeeNames = Object.values(jsonData).map(employee => employee.name);

let employeeNameToID = {};
Object.keys(jsonData).forEach(key => {
    employeeNameToID[key] = jsonData[key].name;
});

let employeeIDtoSalary = {};
Object.keys(jsonData).forEach(key => {
    employeeIDtoSalary[key] = jsonData[key].hourlyRate;
});

let storedJSON = {"details": "none"}

app.get('/', (req, res) => {
    res.send(jsonData);
});

app.get('/names', (req, res) => {
    res.send(employeeNames);
});

app.get('/names-with-id', (req, res) => {
    res.send(employeeNameToID);
});

app.get('/salary', (req, res) => {
    let employeeID = req.query.id;

    res.send(employeeIDtoSalary[employeeID].toString());
});

app.get('/get-two-names-from-id', (req, res) => {
    let employeeID1 = req.query.empID1;
    let employeeID2 = req.query.empID2;

    let employeeName1 = jsonData[employeeID1].name;
    let employeeName2 = jsonData[employeeID2].name;

    res.send([employeeName1, employeeName2]);
});

app.put('/update-stored-json', (req, res) => {
    const requestData = req.body;

    storedJSON["details"] = "last update at " + requestData["time"]
  
    res.json(
            { 
                "message": 'Data updated successfully', 
                "newData": storedJSON
            }
        );
});

app.get('/get-stored-json', (req, res) => {

    res.send(storedJSON);
});

app.get("/users", async (request, response) => {
    const users = await User.find({});
    try {
      response.send(users);
    } catch (error) {
      response.status(500).send(error);
    }
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});
