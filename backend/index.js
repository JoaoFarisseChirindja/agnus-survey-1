var express = require("express");
var bodyParser = require("body-parser");
var session = require("express-session");
var dbadapter = require("./dbadapter");
var mysqldbadapter = require("./mysqldbadapter");
var inmemorydbadapter = require("./inmemorydbadapter");
var dotenv = require("dotenv").config();
var path = require("path");

var app = express();
app.use(
  session({
    secret: process.env.secret,
    resave: true,
    saveUninitialized: true,
    //cookie: { secure: true }
  })
);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

function getDBAdapter(req) {
  var db = new mysqldbadapter();
  //var db = new dbadapter();
  //var db = new inmemorydbadapter(req.session);
  return db;
}

function sendJsonResult(res, obj) {
  res.setHeader("Content-Type", "application/json");
  res.send(JSON.stringify(obj));
}

app.get("/getActive", function (req, res) {
  var db = getDBAdapter(req);
  db.getSurveys(function (result) {
    sendJsonResult(res, result);
  });
});

app.get("/getSurvey", function (req, res) {
  var db = getDBAdapter(req);
  var surveyId = req.query["surveyId"];
  db.getSurvey(surveyId, function (result) {
    sendJsonResult(res, result);
  });
});

app.get("/changeName", function (req, res) {
  var db = getDBAdapter(req);
  var id = req.query["id"];
  var name = req.query["name"];
  db.changeName(id, name, function (result) {
    sendJsonResult(res, result);
  });
});

app.get("/create", function (req, res) {
  var db = getDBAdapter(req);
  var name = req.query["name"];
  db.addSurvey(name, function (result) {
    sendJsonResult(res, { Name: result.name, Id: result.name });
    console.log("OLa");
  });
});

app.post("/changeJson", function (req, res) {
  var db = getDBAdapter(req);
  var id = req.body.Id;
  var json = req.body.Json;
  db.storeSurvey(id, json, function (result) {
    sendJsonResult(res, result.json);
  });
});

app.post("/post", function (req, res) {
  var db = getDBAdapter(req);
  var postId = req.body.postId;
  var surveyResult = req.body.surveyResult;
  db.postResults(postId, surveyResult, function (result) {
    sendJsonResult(res, result.json);
  });
});

app.get("/delete", function (req, res) {
  var db = getDBAdapter(req);
  var surveyId = req.query["id"];
  db.deleteSurvey(surveyId, function (result) {
    sendJsonResult(res, {});
  });
});

app.get("/results", function (req, res) {
  var db = getDBAdapter(req);
  var postId = req.query["postId"];
  db.getResults(postId, function (result) {
    sendJsonResult(res, result);
  });
});

app.use(express.static(__dirname + "/public"));
app.use("/images", express.static(path.join(__dirname, "..", "uploads")));

app.listen(process.env.PORT || 3000, function () {
  console.log("Listening!");
});
