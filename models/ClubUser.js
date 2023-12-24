const mongoose = require("mongoose");

// Define user schema
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    required: true,
    default: "user",
  },
});

const User = mongoose.model("User", userSchema);

// Define UserDetails schema
const userDetailsSchema = new mongoose.Schema({
  userID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
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
      // You can include additional information about the user's membership if needed
    },
  ],
});

const UserDetails = mongoose.model("UserDetails", userDetailsSchema);

// Post-save hook for User model
userSchema.post('save', async function (doc, next) {
  try {
    // Create a UserDetails document for the user
    await UserDetails.create({ userID: doc._id });

    // Continue with the next middleware or operation
    next();
  } catch (error) {
    // Handle error
    next(error);
  }
});

module.exports = { User, UserDetails };
