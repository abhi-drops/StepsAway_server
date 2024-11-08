
const users = require('../Models/userSchema')
const jwt = require('jsonwebtoken')
exports.register=async(req,res)=>{

  console.log('inside register function');
  const {userName,userEmail,userPassword}=req.body;

  let isAdm = false;

  if(userEmail === process.env.ADMIN_MAIL){
    console.log("admin email found");
    isAdm = true;
  }

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
        userName,userEmail,userPassword, userPic:(Math.floor(100000 + Math.random() * 900000)),userBio:"Set your new user bio using Edit Button ",userInst:"",userFB:"",userCities:[],userCircles:[],userNotes:[],userEvents:[],userAlerts:[],userLikedNotes:[],userlikedEvents:[],userFollowing:[],userFollowers:[],isUserBanned:false,isUserAdmin:isAdm
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
  console.log(userName, userPassword);
  try {
    const existingUser = await users.findOne({ userName, userPassword });

    // Check if user exists
    if (!existingUser) {
      return res.status(401).json("Invalid username or password");
    }

    // Check if the user is banned
    if (existingUser.isUserBanned) {
      return res.status(403).json({ message: "Account is banned. Please contact support." });
    }

    // Generate JWT token
    const token = jwt.sign({ userId: existingUser._id }, process.env.JWT_SECRET);
    console.log("Generated Token:", token);

    // Populate user data for response
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
  } catch (err) {
    console.log("Login Error:", err);
    res.status(401).json(err);
  }
};

exports.getUserData = async (req, res) => {
  try {
    const userId = req.payload;
    const { fetchUserId } = req.body;
    console.log("fetchUserId:",fetchUserId);


    if (fetchUserId && fetchUserId != userId && fetchUserId != "1"  )  {
      console.log("fetch other user's data");

      console.log("User ID from body:", fetchUserId);

    const newUser = await users.findById(fetchUserId)
      .select('-userPassword') // Exclude password
      .populate("userCities")
      .populate("userCircles")
      .populate("userNotes")
      .populate("userEvents")
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


    }else{
      console.log("fetch loginned user data ");

      console.log("User ID from payload:", userId);

    const newUser = await users.findById(userId)
      .select('-userPassword') // Exclude password
      .populate("userCities")
      .populate("userCircles")
      .populate("userNotes")
      .populate("userEvents")
      // .populate("userAlerts")
      // .populate("userLikedNotes")
      // .populate("userlikedEvents")
      .populate({
        path: 'userFollowing',
        select: 'userName _id userPic', // Specify fields to include
      })
      .populate({
        path: 'userFollowers',
        select: 'userName _id userPic', // Specify fields to include
      })
      .exec();

    if (!newUser) {
      res.status(404).json("User not found");
    } else {
      res.status(200).json(newUser);
    }

    }
// Make sure payload contains userId

  } catch (err) {
    console.log("Error fetching user data:", err);
    res.status(401).json(err);
  }
};

exports.editUserData = async (req, res) => {
  try {
    // Get userId from the JWT payload or from headers, depending on your setup
    const userId = req.payload; // Assuming `jwtMiddleware` attaches `payload` to `req`

    // Get fields from the request body
    const { userPic, userBio, userInst, userFB } = req.body;

    // Update user data with provided fields, if they exist in the request body
    const updatedUser = await users.findByIdAndUpdate(
      userId,
      {
        ...(userPic && { userPic }),
        ...(userBio && { userBio }),
        ...(userInst && { userInst }),
        ...(userFB && { userFB }),
      },
      { new: true, runValidators: true } // Return the updated user document
    ).select('-userPassword'); // Exclude password

    if (!updatedUser) {
      return res.status(404).json("User not found");
    }

    res.status(200).json(updatedUser); // Return updated user data
  } catch (err) {
    console.log("Error updating user data:", err);
    res.status(500).json("Error updating user data");
  }
};

exports.followUser = async (req, res) => {
  try {
    const userId = req.payload; // Get logged-in user's ID from payload
    const { targetUserId } = req.body; // ID of the user to be followed/unfollowed

    if (userId === targetUserId) {
      return res.status(400).json({ message: "You cannot follow yourself" });
    }

    // Find the target user to be followed/unfollowed
    const targetUser = await users.findById(targetUserId);
    const currentUser = await users.findById(userId);

    if (!targetUser || !currentUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const isFollowing = currentUser.userFollowing.includes(targetUserId);

    if (isFollowing) {
      // If already following, unfollow
      currentUser.userFollowing = currentUser.userFollowing.filter(
        (id) => id.toString() !== targetUserId
      );
      targetUser.userFollowers = targetUser.userFollowers.filter(
        (id) => id.toString() !== userId
      );

      await currentUser.save();
      await targetUser.save();

      res.status(200).json({ message: "User unfollowed", currentUser });
    } else {
      // If not following, follow
      currentUser.userFollowing.push(targetUserId);
      targetUser.userFollowers.push(userId);

      await currentUser.save();
      await targetUser.save();

      res.status(200).json({ message: "User followed", currentUser });
    }
  } catch (err) {
    console.log("Error following/unfollowing user:", err);
    res.status(500).json("Error following/unfollowing user");
  }
};

exports.banUser = async (req, res) => {
  try {
    const adminUserId = req.payload; // Extract admin user ID from JWT payload
    const { targetUserId, banStatus } = req.body; // ID of the user to ban/unban and the desired ban status

    // Check if the user making the request is an admin
    const adminUser = await users.findById(adminUserId);
    if (!adminUser || !adminUser.isUserAdmin) {
      return res.status(403).json({ message: "Unauthorized: Admin privileges required" });
    }

    // Find the target user
    const targetUser = await users.findById(targetUserId);
    if (!targetUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update the ban status of the target user
    targetUser.isUserBanned = banStatus;
    await targetUser.save();

    res.status(200).json({ message: `User ${banStatus ? "banned" : "unbanned"} successfully` });
  } catch (err) {
    console.log("Error banning/unbanning user:", err);
    res.status(500).json("Error banning/unbanning user");
  }
};
