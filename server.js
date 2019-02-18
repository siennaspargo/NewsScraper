
// Dependencies must use for credit
var express = require("express");
var exphbs = require("express-handlebars");
var mongoose = require("mongoose");
var cheerio = require("cheerio");
var axios = require("axios");
// extra dependencies
var logger = require("morgan");
var bodyParser = require("body-parser");

// Requiring the databases
var dbA = require("./models/Article");
var dbS = require("./models/Saved");
var dbN = require("./models/Note");

// If deployed, use the deployed database. Otherwise use the local mongoHeadlines database
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/ArticlesAndNotes";

// Connect to the Mongo DB
mongoose.connect(MONGODB_URI, { useNewUrlParser: true });

var PORT = process.env.PORT || 3000;


app.use(logger("dev"));
// Request body as JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// Make public a static folder
app.use(express.static("public"));

// Handlebars
app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");


// Simple index route
app.get("/", function(req, res) {
  res.render("scraper")
});


// A GET route for scraping the echoJS website
app.get("/scrape", function(req, res) {
  // grab the body of the html with axios
  axios.get("http://www.echojs.com/").then(function(response) {
  
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
      dbA.Article.create(result)
        .then(function(dbArticle) {
          // View the added result in the console
          console.log(dbArticle);
        })
        .catch(function(err) {
          // If an error occurred, log it
          console.log(err);
        });
    });
        res.send("Scrape Complete");
      });
    });

// Route for getting all Articles from the dbA
app.get("/articles", function(req, res) {
  dbA.Article.find({})
    .then(function(dbArticle) {
      // If successful, send results back to the client
      res.json(dbArticle);
    })
    .catch(function(err) {
      res.json(err);
    });
});


// Route for grabbing a specific Article by id, populate it with it's note
app.get("/articles/:id", function(req, res) {

  var id = req.params.id
  dbA.findOne({ _id: id })
    .then(function (dbArticle) {

      var saveArticle = {
        title: dbArticle.title,
        link: dbArticle.link,
        description: dbArticle.description,
        image: dbArticle.image
      }
      dbS.create(saveArticle)
      res.json(dbArticle);
    })
    .catch(function(err) {
      res.json(err);
    });
  });

// Route for deleting Saved Articles
app.delete("/clear", function (req, res) {
  dbA.deleteMany({}, function (err) { });
})

// Route for grabbing saved Articles
app.get("savedArticles", function (req,res) {
  dbS.find({})
  .then(function (dbArticle) {
    res.json(dbArticle);
  })
  .catch(function (err) {
    res.json(err);
  });
});

// Route for rendering Saved Articles
app.get("/saved", function (req, res) {
  res.render("saved")
});

// Route for deleting a specific saved article
app.delete("/deletesaved/:id", function (req,res) {
  var id = req.params.id
  dbS.findByIdAndRemove(id, function () {
  })
  res.render("saved")
});


// Route for deleting all saved Articles
app.delete("/clearsaved", function (req, res) {
  dbS.deleteMany({}, function (err) { });
})

// Route for grabbing Article note
app.get("./notes/:id", function (req,res) {
  dbN.find({articleId: req.params.id})
  .then(function (dbNote) {
    res.json(dbNote)
  })
  .catch(function (err) {
    res.json(err);
  });
});

// Route for article Note and with no match exists, then update inserts
app.post("/articles/:id", function (req,res) {
  dbN.create(req.body)
  .then(function (dbNote) {
    return dbN.findOneAndModify({_id: req.params.id}, {note: dbNote._id}, {upsert: true}, {new: true});
  })
    .then(function (dbArticle) {
      res.json(dbArticle);
    })
    .catch(function (err) {
      res.json(err);
    });
  });


// Route for deleting specific note
  app.delete("/deleteNote/:id", function (req,res) {
    var id = req.params.id
    dbN.findByIdAndRemove(id, function () {
    })
    res.render("saved")
  })


// Start the server
app.listen(PORT, function() {
  console.log("App running on port " + PORT );
});