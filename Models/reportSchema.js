const mongoose = require('mongoose');
const { Schema } = mongoose;

const reportSchema = new mongoose.Schema({
  reportType: {
    type: String,
    required: true,
  },
  reportAgainstUserId: {
    type: Schema.Types.ObjectId, ref: 'users',
  },
  reportedUserName: {
    type: String,
  },
  reportCompliance: [
    {
      userId: { type: Schema.Types.ObjectId, ref: 'users', required: true },
      userName: String,
      details: String,
    }
  ],
  reportNoteId: {
    type: Schema.Types.ObjectId, ref: 'notes',
  },
  noteTitle: String,
  reportEventId: {
    type: Schema.Types.ObjectId, ref: 'events',
  },
  eventTitle: String,
  reportResolve: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

const reports = mongoose.model("reports", reportSchema);
module.exports = reports;
