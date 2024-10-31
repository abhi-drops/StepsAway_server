
const users = require('../Models/userSchema')
const jwt = require('jsonwebtoken')
exports.register=async(req,res)=>{
  console.log('inside register function');
  const {userName,userEmail,userPassword}=req.body;

  try {
    const existingUser = await users.findOne({userEmail})
    console.log(existingUser);

    const existingUser2 = await users.findOne({userName})
    console.log(existingUser);



    if (existingUser) {
      res.status(406).json("email id already exist")
    }else if (existingUser2){
      res.status(406).json("username already exist")
    }else{
      const newUser = new users({
        userName,userEmail,userPassword, userPic:"",userCities:[],userCircles:[],userNotes:[],userEvents:[],userAlerts:[],userLikedNotes:[],userlikedEvents:[],userFollowing:[],userFollowers:[],isUserBanned:false,isUserAdmin:false
      })
        await newUser.save()
        res.status(200).json(newUser)
    }

  } catch(err) {
    res.status(401).json(err)
  }

}
exports.login = async (req, res) => {
  const { userName, userPassword } = req.body;
  console.log(userName,userPassword)
  try {
    const existingUser = await users.findOne({ userName, userPassword });
    if (existingUser) {
      const token = jwt.sign({ userId: existingUser._id }, process.env.JWT_SECRET);
      console.log("Generated Token:", token);

      const updatedUser = await users.findById(existingUser._id)
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

      res.status(200).json({ updatedUser, token });
    } else {
      res.status(401).json("Invalid username or password");
    }
  } catch (err) {
    console.log("Login Error:", err);
    res.status(401).json(err);
  }
};


exports.getUserData = async (req, res) => {
  try {
    const userId = req.payload;
// Make sure payload contains userId
    console.log("User ID from payload:", userId);

    const newUser = await users.findById(userId)
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

    if (!newUser) {
      res.status(404).json("User not found");
    } else {
      res.status(200).json(newUser);
    }
  } catch (err) {
    console.log("Error fetching user data:", err);
    res.status(401).json(err);
  }
};
