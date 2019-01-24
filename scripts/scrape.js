

// database configuration
var databaseUrl = "scraper";
var collections = ("scrapedData");

// mongojs configuration to the db variable
var db = mongojs(databaseUrl, collections);
db.Note("error", function(error) {
  console.log("Database Error:", error);
});

// First, tell the console what server.js is doing
console.log("\n***********************************\n" +
  "Grabbing articles and images\n" +
  "from Huffington Post:" +
  "\n***********************************\n");


// Making a request via axios for reddit's "webdev" board. We are sure to use old.reddit due to changes in HTML structure for the new reddit. The page's Response is passed as our promise argument.

// when we send a get request to localhost:3000/
app.get("/", function(req, res) {
  // Axios will do it's own get request to http://www.virginislandsdailynews.com/
  axios
    .get("http://www.virginislandsdailynews.com/")
    .then(function (response) {
      console.log('axios tests')
      // Load the Response into cheerio and save it to a variable
      // '$' becomes a shorthand for cheerio's selector commands, much like jQuery's '$'
      var $ = cheerio.load(response.data);
      
      // With cheerio, find each p-tag with the "title" class
      // (i: iterator. element: the current element)
      $("div.card").each(function (i, element) {
      
        var result = {};

        //  result.title = $(this)
        //   .children("div.card__content")
        //   .children("div.card__content")
        //   .children("div.card__headlines")
        //   .children("div.card__headline")
        //   .children("a.card__link")
        //   .children("div.card__headline__text")
        //   .text()
        //  result.link = $(this).children().attr("href");

        result.title = "this is the title";
        result.link = "www.link.com"

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

    // Log the results once you've looped through each of the elements found with cheerio
  });