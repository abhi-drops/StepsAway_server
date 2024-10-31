const mongoose = require('mongoose');
const { array } = require('../Middleware/multerMiddleware');
const { Schema } = mongoose;

const noteSchema = new mongoose.Schema({

  cityId: {
    type: Schema.Types.ObjectId, ref: 'cities'
  },
  circleId: {
    type: Schema.Types.ObjectId, ref: 'circles'
  },
  noteTitle: {
    type: String,
  },
  noteDes: {
    type: String,
  },
  noteCreatorId: {
    type: Schema.Types.ObjectId, ref: 'users'
  },
  noteLikedUsers:  {
    type: [{ type: Schema.Types.ObjectId, ref: 'users' }]
  },
  noteComments: {
    type: Array
  },
}, { timestamps: true });

const notes = mongoose.model("notes", noteSchema);
module.exports = notes;
