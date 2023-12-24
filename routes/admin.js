// routes/clubPostRoutes.js
const express = require('express');
const router = express.Router();
const ClubPost = require('../models/ClubPost');
const { AdminDetails } = require('../models/ClubAdmin');


router.get('/getbyId/:postId', async (req, res) => {
  const postId = req.params.postId;

  try {
    
    const post = await ClubPost.findById(postId);

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    res.status(200).json(post);
  } catch (error) {
    console.error('Error fetching club post:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});



router.post("/", async (req, res) => {
  try {
    const { adminID, clubName, title, description, coordinators } = req.body;
    if (!title || !adminID) {
      return res.status(400).json({ error: "title, and adminID are required" });
    }

    const clubPost = new ClubPost(req.body);
    await clubPost.save();

    // Update AdminDetails with the new post
    await AdminDetails.findOneAndUpdate(
      { adminID: adminID },
      {
        $push: {
          posts: {
            postId: clubPost._id,
            title: req.body.title,
          },
        },
      },
      { new: true, upsert: true }
    );

    res.status(201).json(clubPost);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get("/adminPosts/:adminID", async (req, res) => {
    try {
      const adminIDFromURL = req.params.adminID;
  
      if (!adminIDFromURL) {
        return res.status(400).json({ error: "adminID is required" });
      }
  
      // Fetch posts based on adminID
      const adminDetails = await AdminDetails.findOne({
        adminID: adminIDFromURL,
      });
  
      if (!adminDetails) {
        return res.status(404).json({ error: "Admin details not found" });
      }
  
      const posts = adminDetails.posts;
  
      res.status(200).json({ posts });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });


router.put('/:postId', async (req, res) => {
    const postId = req.params.postId;
  
    try {
      const post = await ClubPost.findById(postId);
  
      if (!post) {
        return res.status(404).json({ error: 'Post not found' });
      }
  
      const currentTitle = post.title;
  
      post.title = req.body.title || post.title;
      post.description = req.body.description || post.description;
      post.coordinators = req.body.coordinators || post.coordinators;
  
      const updatedPost = await post.save();
  
      if (currentTitle !== req.body.title) {
        await AdminDetails.findOneAndUpdate(
          { 'posts.postId': postId },
          {
            $set: {
              'posts.$.title': req.body.title,
            },
          }
        );
      }
  
      res.status(200).json(updatedPost);
    } catch (error) {
      console.error('Error updating club post:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
  
  router.delete('/clubPosts/:postId', async (req, res) => {
    const postId = req.params.postId;
  
    try {
      // Check if the post with the given ID exists
      const post = await ClubPost.findById(postId);
  
      if (!post) {
        return res.status(404).json({ error: 'Post not found' });
      }
  
      // Perform the deletion
      await ClubPost.findByIdAndDelete(postId);
  
      // Remove references to the deleted post in adminDetails
      await AdminDetails.updateMany(
        { 'posts.postId': postId },
        { $pull: { posts: { postId } } }
      );
  
      res.status(200).json({ message: 'Post deleted successfully' });
    } catch (error) {
      console.error('Error deleting post:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

module.exports = router;
