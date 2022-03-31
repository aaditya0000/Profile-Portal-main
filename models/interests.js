const mongoose = require('mongoose');

const interestsSchema = new mongoose.Schema({
  interest : {
    type: String
  }
});

const Interest = mongoose.model('interest', interestsSchema);

module.exports = Interest;
