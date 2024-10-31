const mongoose = require('mongoose');

const { Schema } = mongoose; // Ensure Schema is defined

const userSchema = new mongoose.Schema({
  userName: {
    type: String,
    required: true,
    unique: true,
  },
  userEmail: {
    type: String,
    required: true,
    unique: true,
  },
  userPassword: {
    type: String,
    required: true,
  },
  userPic: {
    type: String,
  },
  userCities: [{ type: Schema.Types.ObjectId, ref: 'cities' }], //
  userCircles: [{ type: Schema.Types.ObjectId, ref: 'circles' }], //
  userNotes: [{ type: Schema.Types.ObjectId, ref: 'notes' }],
  userEvents: [{ type: Schema.Types.ObjectId, ref: 'events' }],
  userAlerts:[{ type: Schema.Types.ObjectId, ref: 'alerts' }],
  userLikedNotes:[{ type: Schema.Types.ObjectId, ref: 'notes' }],
  userlikedEvents:[{ type: Schema.Types.ObjectId, ref: 'events' }],
  userFollowing: [{ type: Schema.Types.ObjectId, ref: 'users' }],
  userFollowers:[{ type: Schema.Types.ObjectId, ref: 'users' }],
  isUserBanned: {
    type: Boolean,
  },
  isUserAdmin: {
    type: Boolean,
  },
});

const users = mongoose.model("users", userSchema);
module.exports = users;
