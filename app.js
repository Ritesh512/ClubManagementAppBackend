const express = require("express");
const cors = require("cors");
require("./models/config");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const path = require("path");
const { User, UserDetails } = require("./models/ClubUser");
const { Admin } = require("./models/ClubAdmin");
const adminRoute = require("./routes/admin");
const userRoute = require("./routes/user");
const superAdmin = require("./routes/superAdmin");
const auth = require("./middleware/auth");

const saltRounds = 10;
const app = express();
app.use(express.static(path.resolve(__dirname, "dist")));
app.use(express.json());
app.use(cors());

const jwtKey = process.env.TOKEN_KEY;

app.post("/register", async (req, res) => {
  const hash = bcrypt.hashSync(req.body.password, saltRounds);

  const userData = {
    name: req.body.name,
    email: req.body.email,
    password: hash,
  };

  try {
    // Create a new user
    const user = await User.create(userData);

    // Create a UserDetails document for the user
    await UserDetails.create({ userID: user._id });

    // Generate a JWT token
    jwt.sign(
      { userId: user._id, role: user.role },
      jwtKey,
      { expiresIn: "1h" },
      (err, token) => {
        if (err) {
          console.log(err);
          res.status(500).json({ error: "Something went wrong!" });
        } else {
          res.status(201).json({ user, auth: token });
        }
      }
    );
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/login", async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password || !role) {
      return res
        .status(400)
        .json({ error: "Email, password, and role are required" });
    }

    let user;

    if (role === "user") {
      user = await User.findOne({ email });
    } else if (role === "admin") {
      user = await Admin.findOne({ email });
    } else {
      return res.status(400).json({ error: "Invalid role" });
    }

    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    if (user.role !== role) {
      return res.status(403).json({ error: "Unauthorized role" });
    }

    const userWithoutPassword = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    const id = user._id;
    const userDetails = await UserDetails.findOne({ userID: id });
    // const likedPostIds = user.likedPosts.map((post) => post.postID);
    // console.log(userDetails.memberOfClubs);

    if (role === "admin") {
      userWithoutPassword.clubName = user.clubName;
    }

    const token = jwt.sign({ user }, jwtKey, { expiresIn: "1h" });

    res.status(200).json({
      user: userWithoutPassword,
      auth: token,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// admin
app.use("/admin/clubPost", auth, adminRoute); // for editing get that post
app.use("/admin/addClubPost", auth, adminRoute);
app.use("/admin/get", auth, adminRoute);
app.use("/admin/update", auth, adminRoute);
app.use("/admin/delete", auth, adminRoute);

// user
app.use("/user/clubPosts", auth, userRoute);
app.use("/user/getUserDetails", auth, userRoute);
app.use("/user/posts", auth, userRoute);
app.use("/user", auth, userRoute);
app.use("/user/comment", auth, userRoute);
app.use("/user/clubpost", auth, userRoute);
app.use("/user/join", auth, userRoute);
require("dotenv").config();

// super admin
app.use("/super", superAdmin);

app.post("/changePassword", auth, async (req, res) => {
  try {
    const { userId, password, newPassword, role } = req.body;

    let model, roleField;

    // Determine the model and role field based on the role
    if (role === "user") {
      model = User;
      roleField = "role";
    } else if (role === "admin") {
      model = Admin;
      roleField = "role";
    } else {
      return res.status(400).json({ error: "Invalid role" });
    }

    // Fetch the user or admin by userId
    const userOrAdmin = await model.findById(userId);

    if (!userOrAdmin) {
      return res.status(404).json({ error: "User or Admin not found" });
    }

    // Check if the current password matches the stored hashed password
    const passwordMatch = await bcrypt.compare(password, userOrAdmin.password);

    if (!passwordMatch) {
      return res.status(401).json({ error: "Invalid current password" });
    }

    // Hash the new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // Update the user's or admin's password
    userOrAdmin.password = hashedNewPassword;
    await userOrAdmin.save();

    res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    console.error("Error changing password:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


app.get("*", (req, res) =>
  res.sendFile(path.resolve(__dirname, "dist", "index.html"))
);

const PORT = process.env.PORT || 3000;
app.listen(PORT, function (req, res) {
  console.log("Server listed on port 8080");
});
