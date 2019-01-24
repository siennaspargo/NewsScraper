// connecting to the database

// Dependencies
var express = require("express");
var logger = require("morgan");
var mongojs = require("mongojs");
var mongoose = require("mongoose");

// Requiring the `User` model for accessing the `users` collection
var Headline = require("./models/Headline");


// Initialize Express
var app = express();

// Configure our app for morgan and body parsing with express.json and express.urlEncoded
app.use(logger("dev"));
// Parse request body as JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// Make public a static folder
app.use(express.static("public"));

// Connect to the Mongo DB
mongoose.connect("mongodb://localhost/userdb", { useNewUrlParser: true });

// Mongojs configuration
var databaseUrl = "NotesAndArticles";
var collections = ["articles"];

// Hook our mongojs config to the db var
var db = mongojs(databaseUrl, collections);
db.on("error", function(error) {
  console.log("Database Error:", error);
});


// Routes
// ======

// Your goal is to complete the routes in the server file so the site can display and edit the article/comments data. Don't worry about the front end, just use MongoJS to finish the routes


// post an article to the mongoose database

// Post a book to the mongoose database
app.post("/submit", function(req, res) {
  // Save the request body as an object called article
  var article = req.body;

  // If we want the object to have a boolean value of false,
  // we have to do it here, because the ajax post will convert it
  // to a string instead of a boolean
  article.read = false;

  // save the book object as an entry into the books collection in mongo
  db.articles.save(article, function (error, saved) {
    // show errors
    if (error) {
      console.log(error);
    } else {
      // send response to the client (for AJAX success function)
      res.send(saved);
    }
  })
});


// find all articles in the database
// Find all books marked as read
app.get("/read", function(req, res) {
  // go into mongo collection, find all docs where "read" is true
  db.articles.find({ read: true }, function(error, found) {
    // show any errors
    if (error) {
      console.log(error);
    } else {
      // otherwise, send the books we found to the browser as a json
      res.json(found);
    }
  })
});

// Find all books marked as unread
app.get("/unread", function(req, res) {
  // go into the mongo collection, and find all doc where "read" is false
  db.articles.find({ read: false}, function(error, found) {
    // show any errors
    if (error) {
      console.log(error);
    } else {
      // otherwise, send the books we found to the browser as a json
      res.json(found);
    }
  })
});

// Mark an article as having been read
// post or put, not get for updating the database
app.post("/markread/:id", function(req, res) {
  // Remember: when searching by an id, the id needs to be passed in
  // as (mongojs.ObjectId(IdYouWantToFind))
  db.articles.update(
    {
      _id: mongojs.ObjectId(req.params.id)
    },
    {
      // set "read" to true for the article we specified
      $set: {
        read: true
      }
    },
    // when the book has been set to true, run this next function:
    function(error, edited) {
      // show any errors
      if (error) {
        console.log(error);
        res.send(error);
      } else {
        // otherwise, send the result of our update to the browser
        console.log(edited);
        res.send(edited);
      }
    }
  );
});

// Mark a book as having been not read
app.post("/markunread/:id", function(req, res) {
  // Remember: when searching by an id, the id needs to be passed in
  // as (mongojs.ObjectId(IdYouWantToFind))

  // update a doc in the books collection with an ObjectId matching the id parameter in the url
  db.articles.update(
    {
      _id: mongojs.ObjectId(req.params.id)
    },
    {
      // set "read" to false for the book we specified
      $set: {
        read: false
      }
    },
    // When that is done, run this function
    function(error, edited) {
      // show any errors
      if (error) {
        console.log(error);
        res.send(error);
      } else {
       // otherwise, send the result of our update to the browser
       console.log(edited);
       res.send(edited);
      }
    }
  );
});


// remove an article from the database


// post a comment on an article in the database


// remove a comment from the database









// Listen on port 3000
app.listen(3000, function() {
  console.log("App running on port 3000!");
});


























// // andrew8412@gmail.com

// // dependencies
// var express = require("express");
// var mongojs = require("mongojs");
// var exphbs = require("express-handlebars");
// var mongoose = require("mongoose");

// // require axios and cheerio to make scraping possible
// var cheerio = require("cheerio");
// var axios = require("axios");

// var bodyParser = require("body-parser");

// var db = require('./models')
// var request = require("request");

// // listen on port
// var PORT = process.env.PORT || 3000; 

// // Initialize Express
// var app = express();

// // Database configuration
// // Save the URL of our database as well as the name of our collection
// var databaseUrl = "NotesAndArticles";
// var collections = ["articles"];

// // Use mongojs to hook the database to the db variable
// var db = mongojs(databaseUrl, collections);

// // This makes sure that any errors are logged if mongodb runs into an issue
// db.on("error", function(error) {
//   console.log("Database Error:", error);
// });



// // express router
// var router = express.Router();

// mongoose.connect("mongodb://localhost/Web Scraper", { useNewUrlParser: true });

// // public folder is static library
// app.use(express.static(__dirname + "/public"));

// app.engine("handlebars", exphbs({
//   defaultLayout: "main"
// }));

// // use bodyParser
// app.use(bodyParser.urlencoded({
//   extended: false
// }));

// // make requests go through router middleware
// app.use(router);

// // if deployed, use the deployed database, if not, use local database
// var db = process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";

// // connect to db
// mongoose.connect(db, function(error) {
//   if (error) {
//     console.log(error)
//   } else {
//     console.log("mongoose connection is successful!!");
//   }
// });



// app.get("/", function(req, res) {
//   res.send("homepages")
// })


// // Start the server
// app.listen(PORT, function() {
//   console.log("App running on port " + PORT + "!");
// });
