const express = require('express');
const router = express.Router();
const { Admin,AdminDetails } = require('../models/ClubAdmin'); 
const bcrypt = require("bcrypt");

const security_Key = process.env.SECRET_KEY;

router.post("/createAdmin", async (req, res) => {
    try {
      const { name, email, password, clubName,securityKey } = req.body;
  
      if (!name || !email || !password || !clubName) {
        return res
          .status(400)
          .json({ error: "Name, email, password, and clubName are required" });
      }
  
      if(securityKey!==security_Key){
        console.log("Security key");
        return res
          .status(400)
          .json({ error: "Access Denied" });
      }
  
      const existingAdmin = await Admin.findOne({ email });
      if (existingAdmin) {
        return res
          .status(400)
          .json({ error: "Admin with this email already exists" });
      }
  
      const hashedPassword = await bcrypt.hash(password, 10);
  
      // Create a new admin instance
      const newAdmin = new Admin({
        name,
        email,
        password: hashedPassword,
        clubName,
      });
  
      // Save the new admin to the database
      const savedAdmin = await newAdmin.save();
  
      // Create a new adminDetails instance
      const newAdminDetails = new AdminDetails({
        adminID: savedAdmin._id, 
        clubName,
        posts: [], 
      });
  
      // Save the new adminDetails to the database
      await newAdminDetails.save();
  
      res.status(201).json({
        message: "Admin and AdminDetails created successfully",
        admin: savedAdmin,
        adminDetails: newAdminDetails,
      });
    } catch (error) {
      console.error("Error creating admin and admin details:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

module.exports = router;