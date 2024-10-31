const circles = require("../Models/circleSchema");
const notes = require("../Models/noteSchema");
const cities = require("../Models/citySchema");
const users = require("../Models/userSchema");


exports.addNewNote = async (req, res) => {
  console.log("inside addNewNote function");
  const {cityId,circleId , noteTitle , noteDes } = req.body;
  const userId = req.payload // Correctly extract userId
  console.log("userid:",userId)

  try {

      const newNote = new notes({
        cityId,
        circleId, // Make sure userId is pushed directly as ObjectId
        noteTitle,
        noteDes,
        noteCreatorId: userId,
        noteLikedUsers: [],
        noteComments:[],
      });
      await newNote.save();

      await circles.findByIdAndUpdate(circleId, {
        $push: { circleNotes: newNote._id },
      });

      await users.findByIdAndUpdate(userId, {
        $push: { userNotes: newNote._id },
      });

      res.status(200).json(newNote);

  } catch (err) {
    res.status(401).json(err);
  }
};


exports.getNoteData = async (req, res) => {
  try {

    const {NoteId}= req.params

    const newNote = await notes.findById(NoteId)
      .populate({
        path: 'noteCreatorId',
        select: 'userName _id userPic', // Specify fields to include
      })
      .populate(
        {
          path: 'noteLikedUsers',
          select: 'userName _id userPic', // Specify fields to include
        }
      )
      // populate events and alerts - future
      .exec();

    if (!newNote) {
      res.status(404).json("Note not found");
    } else {
      res.status(200).json(newNote);
    }
  } catch (err) {
    console.log("Error fetching Note data:", err);
    res.status(401).json(err);
  }
};
