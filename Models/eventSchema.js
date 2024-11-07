const mongoose = require('mongoose');
const { Schema } = mongoose;

const eventSchema = new mongoose.Schema({

  cityId: {
    type: Schema.Types.ObjectId, ref: 'cities'
  },
  eventTitle: {
    type: String,
  },
  eventDes: {
    type: String,
  },
  eventCreatorId: {
    type: Schema.Types.ObjectId, ref: 'users'
  },
  eventDate:{
    type: Date,
  },
  eventLikedUsers:  {
    type: [{ type: Schema.Types.ObjectId, ref: 'users' }]
  },
  eventComments: {
    type: Array
  },
}, { timestamps: true });

const events = mongoose.model("events", eventSchema);
module.exports = events;
