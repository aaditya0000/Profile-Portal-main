const mongoose = require('mongoose');

const skillsSchema = new mongoose.Schema({
  skill : {
    type: String
  }
});

const Skill = mongoose.model('skill', skillsSchema);

module.exports = Skill;
