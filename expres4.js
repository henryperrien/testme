const express = require('express');
const cookieParser = require('cookie-parser');
const app = express();
const port = 3000;
var fs = require("fs");
const { MongoClient } = require("mongodb");
const uri = "mongodb+srv://henryperrien:Wojtek53748476301@cluster0.p1yctfh.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const client = new MongoClient(uri);
let database;

app.listen(port);
console.log('Server started at http://localhost:' + port);

async function run() {
  try {
    await client.connect();
    database = client.db('My415DB');
  } catch(error){
    console.log(error);
  }
}


run();

// Middleware to handle jsons and URL encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes go here

//Default route handler
app.get('/', function (req, res) {
  if(req.cookies.loggedInUser){
    res.send('Logged in. <a href="/clearcookie">Delete Cookie</a>');
  }else{
    fs.readFile('login.html','utf8',(err,data)=>{
      console.log(data)
      if(err){
        res.send('some err occured ',err);
      }
      res.send(data);
    })
  }
});

//  How to grab data from a POST request
app.post('/login', async function(req, res) {
  const { username, password } = req.body;
  const users = database.collection('UserCollection415');
  const user = await users.findOne({ username, password});
  if(user){
    res.cookie('loggedInUser',username , { maxAge: 60000 });
    res.send("Successfully Logged In. Cookie has been set");
  } else{
    res.send('No user found. <a href="/">Back</a>');
  }
});

app.post('/register', async (req, res) => {
  const { username, password } = req.body;
  const users = database.collection('UserCollection415');
  await users.insertOne({ username, password });
  res.redirect('/');
});

app.get('/showcookie', function (req, res) {
  mycookies=req.cookies;
  res.send(JSON.stringify(mycookies) + ' <a href="/clearcookie">Delete Cookie</a>'); //Send the cookies

});

app.get('/clearcookie', function (req, res) {
  res.clearCookie('loggedInUser');
  res.send('Cookie deleted. <a href="/showcookie">Show Cookies</a>')
});
