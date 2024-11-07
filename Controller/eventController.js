

const cities = require("../Models/citySchema");
const users = require("../Models/userSchema");
const events = require("../Models/eventSchema")


exports.addNewEvent = async (req, res) => {
  console.log("inside addNewEvent function");
  const {cityId, eventTitle , eventDes,eventDate } = req.body;
  const userId = req.payload // Correctly extract userId
  console.log("userid:",userId)

  try {

      const newEvent = new events({
        cityId,
        eventTitle,
        eventDes,
        eventCreatorId: userId,
        eventDate,
        eventLikedUsers: [],
        eventComments:[],
      });
      await newEvent.save();

      await users.findByIdAndUpdate(userId, {
        $push: { userEvents: newEvent._id },
      });
      await cities.findByIdAndUpdate(cityId, {
        $push: { cityEventsId: newEvent._id },
      });

      res.status(200).json(newEvent);

  } catch (err) {
    res.status(401).json(err);
  }
};


exports.getEventsData = async (req, res) => {
  try {

    const {cityId}= req.params
    const newCity = await cities.findById(cityId, { cityEventsId: 1 }) // Select only cityEventsId field
      .populate("cityEventsId")
      .exec();

    if (!newCity) {
      res.status(404).json("Events not found");
    } else {
      res.status(200).json(newCity);
    }
  } catch (err) {
    console.log("Error fetching circle data:", err);
    res.status(401).json(err);
  }
};


exports.getEventData = async (req, res) => {
  try {

    const {eventId}= req.params
    const newEvent = await events.findById(eventId)
      .populate
      ({
        path: 'eventCreatorId',
        select: 'userName _id userPic', // Specify fields to include
      })
      .exec();

    if (!newEvent) {
      res.status(404).json("Event not found");
    } else {
      res.status(200).json(newEvent);
    }
  } catch (err) {
    console.log("Error fetching circle data:", err);
    res.status(401).json(err);
  }
};

exports.addEventComment = async (req, res) => {
  try {
    const { eventId } = req.params; // Extract NoteId from URL parameters
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
    const updatedEvent = await events.findByIdAndUpdate(
      eventId,
      { $push: { eventComments: newComment } },
      { new: true } // Return the updated document
    );

    if (!updatedEvent) {
      return res.status(404).json("event not found");
    }

    res.status(200).json(updatedEvent); // Send back the updated note
  } catch (err) {
    console.log("Error adding comment:", err);
    res.status(500).json(err);
  }
};


exports.addEventLike = async (req, res) => {
  try {
    const { eventId } = req.params; // Extract NoteId from URL parameters
    const userId = req.payload; // Extract userId from the request payload

    // Find the note by ID
    const event = await events.findById(eventId);

    if (!event) {
      return res.status(404).json("Event not found");
    }

    // Check if the user has already liked the note
    const userIndex = event.eventLikedUsers.indexOf(userId);

    if (userIndex !== -1) {
      // User has already liked this note, remove the like
      event.eventLikedUsers.splice(userIndex, 1);
      res.status(200).json({ message: "Like removed", updatedEvent: await event.save() });
    } else {
      // User has not liked this note, add the like
      event.eventLikedUsers.push(userId);
      res.status(200).json({ message: "Event liked", updatedEvent: await event.save() });
    }
  } catch (err) {
    console.log("Error adding Event like:", err);
    res.status(500).json(err);
  }
};

exports.editEventNote = async (req, res) => {
  try {
    const { eventId } = req.params; // Extract eventId from URL parameters
    const { eventTitle, eventDes, eventDate } = req.body; // Extract event details from the request body
    const userId = req.payload; // Extract userId from the authenticated payload

    // Find the event by its ID
    const event = await events.findById(eventId);

    // Check if the event exists
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // Check if the user is the creator of the event
    if (event.eventCreatorId.toString() !== userId) {
      return res.status(403).json({ message: "Unauthorized: You are not the event creator" });
    }

    // Update event details
    event.eventTitle = eventTitle || event.eventTitle;
    event.eventDes = eventDes || event.eventDes;
    event.eventDate = eventDate || event.eventDate;

    // Save the updated event
    const updatedEvent = await event.save();

    res.status(200).json({ message: "Event updated successfully", updatedEvent });
  } catch (err) {
    console.log("Error editing event note:", err);
    res.status(500).json(err);
  }
};
