const circles = require("../Models/circleSchema");
const cities = require("../Models/citySchema");
const users = require("../Models/userSchema");

exports.addNewCircle = async (req, res) => {
  console.log("inside addNewCircle function");
  const { circleName, cityId, circlePic } = req.body;
  const userId = req.payload // Correctly extract userId
  console.log("userid:",userId)
  try {
    const existingCircle = await circles.findOne({ circleName });
    if (existingCircle) {
      res.status(406).json("circle name already exists");
    } else {
      const newCircle = new circles({
        circleName,
        circleMembers: [userId], // Make sure userId is pushed directly as ObjectId
        circleNotes: [],
        circlePic,
        circleCreatedBy: userId,
        circleCityId: cityId,
      });
      await newCircle.save();

      await cities.findByIdAndUpdate(cityId, {
        $push: { cityCirclesId: newCircle._id },
      });

      await users.findByIdAndUpdate(userId, {
        $addToSet: { userCities: cityId },
        $push: { userCircles: newCircle._id },
      });

      const updatedUser = await users
        .findById(userId)
        .populate("userCities")
        .populate("userCircles")
        .populate("userNotes")
        // .populate("userEvents")
        // .populate("userAlerts")
        // .populate("userLikedNotes")
        // .populate("userlikedEvents")
        .populate("userFollowing")
        .populate("userFollowers")
        .exec();

      res.status(200).json(updatedUser);
    }
  } catch (err) {
    res.status(401).json(err);
  }
};


exports.getCircleData = async (req, res) => {
  try {

    const {circleId}= req.params

    const newCircle = await circles.findById(circleId)
      .populate("circleMembers")
      .populate("circleNotes")
      // populate events and alerts - future
      .exec();

    if (!newCircle) {
      res.status(404).json("Circle not found");
    } else {
      res.status(200).json(newCircle);
    }
  } catch (err) {
    console.log("Error fetching circle data:", err);
    res.status(401).json(err);
  }
};


exports.searchCircles = async (req, res) => {
  console.log('Inside searchCircles function');
  const { circleName } = req.body;
  console.log(circleName)

  try {
    // Using regex for a partial match search (case-insensitive)
    const matchedCircles = await circles.find(
      { circleName: { $regex: circleName, $options: 'i' } }
    )

    res.status(200).json(matchedCircles);
  } catch (err) {
    res.status(401).json({ error: "Error while searching for circles", details: err });
  }
};