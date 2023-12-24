const express = require('express');
const router = express.Router();
const ClubPost = require('../models/ClubPost');
const { Admin } = require('../models/ClubAdmin'); 
const {  UserDetails } = require("../models/ClubUser");


router.get("/", async (req, res) => {
    try {
      const clubPosts = (await ClubPost.find().slice()).reverse();
      res.json(clubPosts);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  router.get("/getbyId/:postId", async (req, res) => {
    try {
      const postId = req.params.postId;
  
      // Fetch the club post by postId
      const clubPost = await ClubPost.findById(postId);
  
      if (!clubPost) {
        return res.status(404).json({ error: "Club post not found" });
      }
  
      res.status(200).json({ clubPost: clubPost });
    } catch (error) {
      console.error("Error fetching club post details:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

router.get("/like/save", async (req, res) => {
    const userID = req.query.userID;
  
    // Find user by ID
    const user = await UserDetails.findOne({ userID: userID });
  
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
  
    // Extract liked and saved post IDs
    const likedPostIds = user.likedPosts.map((post) => post.postID);
    const savedPostIds = user.savedPosts.map((post) => post.postID);
  
    // Return user details with liked and saved post IDs
    res.json({
      userId: user.userID,
      userName: user.name,
      likedPostIds,
      savedPostIds,
    });
  });

  router.get("/like/:userID", async (req, res) => {
    const { userID } = req.params;
  
    try {
      const userDetails = await UserDetails.findOne({ userID });
  
      if (!userDetails) {
        return res.status(404).json({ error: "User not found" });
      }
  
      const likedPosts = userDetails.likedPosts;
      
      res.status(200).json(likedPosts.slice().reverse());
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  
router.get("/save/:userID", async (req, res) => {
    const { userID } = req.params;
  
    try {
      const userDetails = await UserDetails.findOne({ userID });
  
      if (!userDetails) {
        return res.status(404).json({ error: "User not found" });
      }
  
      const savedPosts = userDetails.savedPosts;
  
      res.status(200).json(savedPosts.slice().reverse());
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });
  

  router.post("/userLike", async (req, res) => {
    const { userID, postID, clubName, title } = req.body;
  
    try {
      // Check if the post is already liked by the user
      const userDetails = await UserDetails.findOne({ userID });
      const isPostLiked = userDetails.likedPosts.some(
        (likedPost) => likedPost.postID.toString() === postID
      );
  
      // Update the likedPosts array in the UserDetails document accordingly
      let updatedUserDetails;
  
      if (isPostLiked) {
        // Remove the post from likedPosts if it's already liked
        updatedUserDetails = await UserDetails.findOneAndUpdate(
          { userID },
          { $pull: { likedPosts: { postID } } },
          { new: true }
        );
      } else {
        // Add the post to likedPosts if it's not liked
        updatedUserDetails = await UserDetails.findOneAndUpdate(
          { userID },
          { $push: { likedPosts: { postID, clubName, title } } },
          { new: true }
        );
      }
  
      // You can send the updatedUserDetails or a success message in the response
      res.status(200).json({
        message: isPostLiked
          ? "Post removed from liked"
          : "Post liked successfully",
        userDetails: updatedUserDetails,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  router.post("/saveUserPost", async (req, res) => {
    const { userID, postID, clubName, title } = req.body;
  
    try {
      // Check if the post is already saved by the user
      const userDetails = await UserDetails.findOne({ userID });
      const isPostSaved = userDetails.savedPosts.some(
        (savedPost) => savedPost.postID.toString() === postID
      );
  
      // Update the savedPosts array in the UserDetails document accordingly
      let updatedUserDetails;
  
      if (isPostSaved) {
        // Remove the post from savedPosts if it's already saved
        updatedUserDetails = await UserDetails.findOneAndUpdate(
          { userID },
          { $pull: { savedPosts: { postID } } },
          { new: true }
        );
      } else {
        // Add the post to savedPosts if it's not saved
        updatedUserDetails = await UserDetails.findOneAndUpdate(
          { userID },
          { $push: { savedPosts: { postID, clubName, title } } },
          { new: true }
        );
      }
  
      // You can send the updatedUserDetails or a success message in the response
      res.status(200).json({
        message: isPostSaved
          ? "Post removed from saved"
          : "Post saved successfully",
        userDetails: updatedUserDetails,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  router.post("/addComment/:postId", async (req, res) => {
    const { postId } = req.params;
    const { userId, name, comment } = req.body;
  
    try {
      const clubPost = await ClubPost.findById(postId);
  
      if (!clubPost) {
        return res.status(404).json({ error: "Post not found" });
      }
  
      // Add the comment to the post's comments array
      clubPost.comments.push({ userId, name, comment });
  
      // Save the updated post
      const updatedClubPost = await clubPost.save();
  
      res.status(201).json(updatedClubPost);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  router.get("/getComments/:postId", async (req, res) => {
    const { postId } = req.params;
  
    try {
      const clubPost = await ClubPost.findById(postId);
  
      if (!clubPost) {
        return res.status(404).json({ error: "Post not found" });
      }
  
      const topComments = clubPost.comments.slice().reverse();
      // console.log(topComments)
  
      res.status(200).json(topComments);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  router.get("/getClubName/:id", async (req, res) => {
    const userID  = req.params.id;
  
    try {
      const admins = await Admin.find({}); 
  
      const formattedAdmins = admins.map((admin) => ({
        id: admin._id,
        clubName: admin.clubName,
        admin: admin.name,
        email: admin.email,
      }));
      
      let userDetails = await UserDetails.findOne({ userID: userID });
      userDetails = userDetails.memberOfClubs.map(member => member.clubID);
  
      res.status(200).json({ formattedAdmins ,userDetails});
    } catch (error) {
      console.error("Error fetching admins:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  router.post("/club", async (req, res) => {
    try {
      const { userID, clubID, clubName } = req.body;
      if (!userID || !clubID || !clubName) {
        return res.status(400).json({ error: "Missing required fields" });
      }
  
      const user = await UserDetails.findOne({ userID });
  
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
  
      const isMember = user.memberOfClubs.some((club) =>
        club.clubID.equals(clubID)
      );
      if (isMember) {
        return res
          .status(400)
          .json({ error: "User is already a member of this club" });
      }
  
      user.memberOfClubs.push({ clubID: clubID, clubName: clubName });
  
      await user.save();
  
      res.status(200).json({ message: "Club added successfully" });
    } catch (error) {
      console.error("Error adding club:", error.message);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });
  

module.exports = router;