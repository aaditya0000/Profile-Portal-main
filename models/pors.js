const mongoose = require('mongoose');

const porsSchema = new mongoose.Schema({
  por : {
    type: String
  }
});

const Por = mongoose.model('por', porsSchema);

module.exports = Por;
