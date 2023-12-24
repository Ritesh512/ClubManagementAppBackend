const mongoose = require("mongoose");

// Define the AdminDetails schema
const adminDetailsSchema = new mongoose.Schema({
  adminID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Admin", // Reference to the Admin model
    required: true,
  },
  clubName: {
    type: String,
    required: true,
  },
  posts: [
    {
      postId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
      },
      title: {
        type: String,
        required: true,
      },
      date: {
        type: Date,
        default: Date.now,
      }
    },
  ],
});

// Define the Admin schema
const adminSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    default: "admin",
    enum: ["admin"],
  },
  clubName: {
    type: String,
    required: true,
  },
});

// Create models
const AdminDetails = mongoose.model("AdminDetails", adminDetailsSchema);
const Admin = mongoose.model("Admin", adminSchema);

module.exports = { AdminDetails, Admin };
