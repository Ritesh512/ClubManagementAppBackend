const mongoose = require('mongoose');

const userDetailsSchema = new mongoose.Schema({
  userID: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    unique: true,
  },
  likedPosts: [
    {
      postID: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
      },
      clubName: {
        type: String,
        required: true,
      },
      title: {
        type: String,
        required: true,
      },
    },
  ],
  savedPosts: [
    {
      postID: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
      },
      clubName: {
        type: String,
        required: true,
      },
      title: {
        type: String,
        required: true,
      },
    },
  ],
  memberOfClubs: [
    {
      clubID: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
      },
      clubName:{
        type:String,
        default:""
      }
    },
  ],
});

const UserDetails = mongoose.model('UserDetails', userDetailsSchema);

module.exports = UserDetails;
