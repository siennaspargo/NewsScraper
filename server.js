// connecting to the database

// Dependencies
var express = require("express");
var logger = require("morgan");
var mongojs = require("mongojs");
var mongoose = require("mongoose");
// Our scraping tools
// Axios is a promised-based http library, similar to jQuery's Ajax method
// It works on the client and on the server
var axios = require("axios");
var cheerio = require("cheerio");


var PORT = process.env.PORT || 3000;

// Requiring the `User` model for accessing the `users` collection
var db = require("./models");


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
mongoose.connect("mongodb://localhost/ArticlesAndNotes", { useNewUrlParser: true });

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


// A GET route for scraping the echoJS website
app.get("/scrape", function(req, res) {
  // First, we grab the body of the html with axios
  axios.get("http://www.echojs.com/").then(function(response) {
    // Then, we load that into cheerio and save it to $ for a shorthand selector
    var $ = cheerio.load(response.data);

    // Now, we grab every h2 within an article tag, and do the following:
    $("article h2").each(function(i, element) {
      // Save an empty result object
      var result = {};

      // Add the text and href of every link, and save them as properties of the result object
      result.title = $(this)
        .children("a")
        .text();
      result.link = $(this)
        .children("a")
        .attr("href");

      // Create a new Article using the `result` object built from scraping
      db.Article.create(result)
        .then(function(dbArticle) {
          // View the added result in the console
          console.log(dbArticle);
        })
        .catch(function(err) {
          // If an error occurred, log it
          console.log(err);
        });
    });

        // Send a message to the client
        res.send("Scrape Complete");
      });
    });

// Route for getting all Articles from the db
app.get("/articles", function(req, res) {
  // Grab every document in the Articles collection
  db.Article.find({})
    .then(function(dbArticle) {
      // If we were able to successfully find Articles, send them back to the client
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});


// Route for grabbing a specific Article by id, populate it with it's note
app.get("/articles/:id", function(req, res) {
  // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
  db.Article.findOne({ _id: req.params.id })
    // ..and populate all of the notes associated with it
    .populate("note")
    .then(function(dbArticle) {
      // If we were able to successfully find an Article with the given id, send it back to the client
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});


// Route for saving/updating an Article's associated Note
app.post("/articles/:id", function(req, res) {
  // Create a new note and pass the req.body to the entry
  db.Note.create(req.body)
    .then(function(dbNote) {
      // If a Note was created successfully, find one Article with an `_id` equal to `req.params.id`. Update the Article to be associated with the new Note
      // { new: true } tells the query that we want it to return the updated User -- it returns the original by default
      // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
      return db.Article.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id }, { new: true });
    })
    .then(function(dbArticle) {
      // If we were able to successfully update an Article, send it back to the client
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

// Start the server
app.listen(PORT, function() {
  console.log("App running on port " + PORT + "!");
});



// // When the server starts, create and save a new Library document to the db
// // The "unique" rule in the Library model's schema will prevent duplicate libraries from being added to the server
// db.Article.create({ name: "Article Library" })
//   .then(function(dbArticle) {
//     // If saved successfully, print the new Library document to the console
//     console.log(dbArticle);
//   })
//   .catch(function(err) {
//     // If an error occurs, print it to the console
//     console.log(err.message);
//   });



// post an article to the mongoose database

// app.post("/submit", function(req, res) {
//   // Save the request body as an object called article

//   // Create a new Book in the database
//   db.Article.create(req.body)
//     .then(function(dbArticle) {
//       // If a Book was created successfully, find one library (there's only one) and push the new Book's _id to the Library's `books` array
//       // { new: true } tells the query that we want it to return the updated Library -- it returns the original by default
//       // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
//       return db.Article.findOneAndUpdate({}, { $push: { articles: dbArticle._id } }, { new: true });
//     })
//     .then(function(dbArticle) {
//       // If the Library was updated successfully, send it back to the client
//       res.json(dbArticle);
//     })
//     .catch(function(err) {
//       // If an error occurs, send it back to the client
//       res.json(err);
//     });
// });

// // Route for getting all books from the db
// app.get("/articles", function(req, res) {
//   // Using our Book model, "find" every book in our db
//   db.Book.find({})
//     .then(function(dbArticle) {
//       // If any Books are found, send them to the client
//       res.json(dbArticle);
//     })
//     .catch(function(err) {
//       // If an error occurs, send it back to the client
//       res.json(err);
//     });
// });

// // Route for getting all libraries from the db
// app.get("/library", function(req, res) {
//   // Using our Library model, "find" every library in our db
//   db.Library.find({})
//     .then(function(dbLibrary) {
//       // If any Libraries are found, send them to the client
//       res.json(dbLibrary);
//     })
//     .catch(function(err) {
//       // If an error occurs, send it back to the client
//       res.json(err);
//     });
// });

// // Route to see what library looks like WITH populating
// app.get("/populated", function(req, res) {
//   // Using our Library model, "find" every library in our db and populate them with any associated books
//   db.Article.find({})
//     // Specify that we want to populate the retrieved libraries with any associated books
//     .populate("books")
//     .then(function(dbArticle) {
//       // If any Libraries are found, send them to the client with any associated Books
//       res.json(dbArticle);
//     })
//     .catch(function(err) {
//       // If an error occurs, send it back to the client
//       res.json(err);
//     });
// });
