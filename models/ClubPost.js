const mongoose = require('mongoose');

const coordinatorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
});

const commentSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  comment: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

const clubPostSchema = new mongoose.Schema({
  adminID: {
    type: String,
    required: true,
  },
  clubName: {
    type:String,
    default: "CSMS",
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  coordinators: [coordinatorSchema],
  comments: {
    type: [commentSchema],
    default: [],
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

const ClubPost = mongoose.model('ClubPost', clubPostSchema);

module.exports = ClubPost;
