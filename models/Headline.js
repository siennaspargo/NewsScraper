var mongoose = require("mongoose");

// Save a reference to the Schema constructor
var Schema = mongoose.Schema;

// Using the Schema constructor, create a new UserSchema object
// This is similar to a Sequelize model
var UserSchema = new Schema({

  headline: {
    type: String,
    trim: false,
    required: "Username is Required"
  },

  summary: {
    type: String,
    trim: false,
  },

  // You can read more about RegEx Patterns here https://www.regexbuddy.com/regex.html
  url: {
    type: String,
    unique: true,
    match: [/(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/]
  }
});

// This creates our model from the above schema, using mongoose's model method
var Headline = mongoose.model("Headline", UserSchema);

// Export the User model
module.exports = Headline;
