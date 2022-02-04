const express = require("express");
const routes = express.Router();
const userModel = require("../models/user.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

routes.post("/register", async (req, res) => {
  let { username, password } = req.body;
  if (!username || typeof username !== "string") {
    return res
      .status(400)
      .json({ status: "error", message: "Invalid username" });
  }
  if (!password || typeof password !== "string") {
    return res
      .status(400)
      .json({ status: "error", message: "Invalid password" });
  }
  if (password.length < 5) {
    return res.status(400).json({
      status: "error",
      message: "Password is too short, 6 characters or more",
    });
  }
  let hashedPassword = await bcrypt.hash(password, 10);
  try {
    const response = await userModel.create({
      username: username,
      password: hashedPassword,
    });
    console.log("a new user was created successfully: ", response);
  } catch (error) {
    if (error.code === 11000) {
      return res
        .status(400)
        .json({ status: "error", message: "Username already in use" }); // duplicated usernames
    }
    throw error; // any other database error
  }
  res.status(200).json({ status: "ok" });
});

routes.post("/login", async (req, res) => {
  const { username, password } = req.body;
  let user = await userModel.findOne({ username }).lean();
  if (!user) {
    return res
      .status(400)
      .json({ status: "error", message: "Invalid username/password" });
  }
  if (await bcrypt.compare(password, user.password)) {
    const token = jwt.sign(
      {
        _id: user._id,
        username: user.username,
      },
      process.env.JWT_SECRET
    );
    return res
      .status(200)
      .json({ status: "ok", message: "success", data: token });
  }
  res
    .status(400)
    .json({ status: "error", message: "Invalid username/password" });
});

routes.post("/change_password", async (req, res) => {
  const { token, newPassword } = req.body;
  if (!newPassword || typeof newPassword !== "string") {
    return res
      .status(400)
      .json({ status: "error", message: "Invalid password" });
  }
  if (newPassword.length < 5) {
    return res.status(400).json({
      status: "error",
      message: "Password is too short, 6 characters or more",
    });
  }
  try {
    const user = jwt.verify(token, process.env.JWT_SECRET);
    let _id = user._id;
    const password = await bcrypt.hash(newPassword, 10);
    await userModel.updateOne({ _id }, { $set: { password } });
    res
      .status(200)
      .json({ status: "ok", message: "password changed successfully" });
  } catch (error) {
    console.log(error.message);
    res.status(400).json({ status: "error", message: "sth is wrong!" });
  }
});

module.exports = routes;
