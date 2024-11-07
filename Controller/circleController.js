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


exports.joinCircle = async (req, res) => {
  console.log("Inside joinCircle function");
  const { circleId } = req.params; // Extract circleId from request parameters
  const userId = req.payload; // Correctly extract userId from the payload
  console.log("userId:", userId);

  try {
    // Find the circle by its ID
    const circle = await circles.findById(circleId);

    if (!circle) {
      return res.status(404).json("Circle not found");
    }

    const cityId = circle.circleCityId; // Get the cityId associated with the circle

    // Check if the user is already a member
    const isMember = circle.circleMembers.includes(userId);

    if (isMember) {
      // If the user is already a member, remove them from the circle
      circle.circleMembers.pull(userId); // Remove userId from circleMembers
      await circle.save();

      // Update the user document to remove the circleId from userCircles
      await users.findByIdAndUpdate(userId, {
        $pull: { userCircles: circleId },
      });

      // Check if the user is still a member of any other circle in the same city
      const userCirclesInCity = await circles.find({
        _id: { $in: (await users.findById(userId)).userCircles },
        circleCityId: cityId,
      });

      // If no other circle in the same city is found, remove the cityId from user's profile
      if (userCirclesInCity.length === 0) {
        await users.findByIdAndUpdate(userId, {
          $pull: { userCities: cityId },
        });
      }

      console.log("User removed from circle:", circleId);
      return res.status(200).json({ message: "User removed from circle", circle });
    } else {
      // If the user is not a member, add them to the circle
      circle.circleMembers.push(userId); // Add userId to circleMembers
      await circle.save();

      // Update the user document to add the circleId to userCircles
      await users.findByIdAndUpdate(userId, {
        $addToSet: { userCircles: circleId, userCities: cityId },
      });

      console.log("User added to circle:", circleId);
      return res.status(200).json({ message: "User added to circle", circle });
    }
  } catch (err) {
    console.log("Error in joinCircle function:", err);
    return res.status(500).json({ error: "Error joining circle", details: err });
  }
};
