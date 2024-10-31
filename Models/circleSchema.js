const mongoose = require('mongoose');
const { Schema } = mongoose;

const circleSchema = new mongoose.Schema({
  circleName: {
    type: String,
    required: true,
    unique: true,
  },
  circleMembers: {
    type: [{ type: Schema.Types.ObjectId, ref: 'users' }],
  },
  circleNotes: [{ type: Schema.Types.ObjectId, ref: 'notes' }],
  circlePic: {
    type: String,
  },
  circleCreatedBy: {
    type: Schema.Types.ObjectId, ref: 'users' // Ensure correct type
  },
  circleCityId: {
    type: Schema.Types.ObjectId, ref: 'cities' // Ensure correct type
  },
});

const circles = mongoose.model("circles", circleSchema);
module.exports = circles;
