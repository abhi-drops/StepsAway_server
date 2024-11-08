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

exports.addNoteComment = async (req, res) => {
  try {
    const { NoteId } = req.params; // Extract NoteId from URL parameters
    const { commentedUserName , commentedUserPic, commentedText } = req.body; // Extract comment data from the request body
    const commentedUserId = req.payload // Correctly extract userId
    // Create a new comment object
    const newComment = {
      commentedUserName,
      commentedUserId,
      commentedUserPic,
      commentedText,
    };

    // Update the note document by pushing the new comment to the noteComments array
    const updatedNote = await notes.findByIdAndUpdate(
      NoteId,
      { $push: { noteComments: newComment } },
      { new: true } // Return the updated document
    );

    if (!updatedNote) {
      return res.status(404).json("Note not found");
    }

    res.status(200).json(updatedNote); // Send back the updated note
  } catch (err) {
    console.log("Error adding comment:", err);
    res.status(500).json(err);
  }
};

exports.addNoteLike = async (req, res) => {
  try {
    const { NoteId } = req.params; // Extract NoteId from URL parameters
    const userId = req.payload; // Extract userId from the request payload

    // Find the note by ID
    const note = await notes.findById(NoteId);

    if (!note) {
      return res.status(404).json("Note not found");
    }

    // Check if the user has already liked the note
    const userIndex = note.noteLikedUsers.indexOf(userId);

    if (userIndex !== -1) {
      // User has already liked this note, remove the like
      note.noteLikedUsers.splice(userIndex, 1);
      res.status(200).json({ message: "Like removed", updatedNote: await note.save() });
    } else {
      // User has not liked this note, add the like
      note.noteLikedUsers.push(userId);
      res.status(200).json({ message: "Note liked", updatedNote: await note.save() });
    }
  } catch (err) {
    console.log("Error adding note like:", err);
    res.status(500).json(err);
  }
};

exports.editCircleNote = async (req, res) => {
  try {
    console.log("inside edit circle function ");

    const { NoteId } = req.params; // Extract NoteId from URL parameters
    const { noteTitle, noteDes } = req.body; // Extract new title and description from the request body
    const userId = req.payload; // Extract userId from the authenticated payload

    console.log("userid in edit circle fn:",userId);

    // Find the note by its ID
    const note = await notes.findById(NoteId);

    // Check if the note exists
    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }

    // Check if the user is the creator of the note
    if (note.noteCreatorId.toString() !== userId) {
      return res.status(403).json({ message: "Unauthorized: You are not the note creator" });
    }

    // Update note details
    note.noteTitle = noteTitle || note.noteTitle;
    note.noteDes = noteDes || note.noteDes;

    // Save the updated note
    const updatedNote = await note.save();

    res.status(200).json({ message: "Note updated successfully", updatedNote });
  } catch (err) {
    console.log("Error editing circle note:", err);
    res.status(500).json(err);
  }
};

// Delete Note Function
exports.deleteNote = async (req, res) => {
  try {
    const { NoteId } = req.params; // Extract NoteId from URL parameters
    const userId = req.payload; // Extract userId from the authenticated payload

    // Find the note by ID
    const note = await notes.findById(NoteId);

    // Check if the note exists
    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }

    // Verify that the user attempting to delete the note is the creator
    const User = await users.findById(userId)

    if (User.isUserAdmin == false){
      return res.status(403).json({ message: "Unauthorized: You are not the note admin" });
    }

    // Remove the note ID from the associated circle and user documents
    await circles.findByIdAndUpdate(note.circleId, {
      $pull: { circleNotes: NoteId }
    });

    await users.findByIdAndUpdate(note.noteCreatorId, {
      $pull: { userNotes: NoteId }
    });

    // Delete the note from the database
    await notes.findByIdAndDelete(NoteId);

    res.status(200).json({ message: "Note deleted successfully" });

  } catch (err) {
    console.log("Error deleting note:", err);
    res.status(500).json({ message: "Error deleting note", error: err });
  }
};
