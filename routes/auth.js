const router = require("express").Router();
const userModel = require("../models/user");
const { signupValidation, loginValidation } = require("../src/validation");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const authMiddleware = require("../middleware");

router.post("/login", async (req, res) => {
  const { error } = loginValidation(req.body);
  if (error) return res.status(400).send(error.details[0].message);
  const { email, password } = req.body;

  const user = await userModel.findOne({ email });
  if (!user) return res.status(400).send("Email/Password mismatch");

  const validPass = await bcrypt.compare(password, user.password);

  if (!validPass) return res.status(400).send("Email/Password mismatch");

  const token = jwt.sign({ id: user._id }, process.env.TOKEN_SECRET);
  res.header("auth-token", token).send({
    message: "Logged In",
  });
});

router.post("/signup", async (req, res) => {
  const { error } = signupValidation(req.body);
  if (error) return res.status(400).send(error.details[0].message);
  const { name, email, password } = req.body;

  const emailExist = await userModel.findOne({ email });
  if (emailExist) return res.status(400).send("Email already exists");

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const user = new userModel({
    name,
    email,
    password: hashedPassword,
  });
  try {
    await user.save();
    res.sendStatus(201);
  } catch (e) {
    res.status(400).send(e);
  }
});

router.get("/details", authMiddleware, async (req, res) => {
  const { id } = req.user;
  try {
    const user = await userModel.findById(id);
    const details = {
      name: user.name,
      email: user.email,
      fines: user.fines,
      isAdmin: user.isAdmin,
      violationFlag: user.violationFlag,
      bookIssueInfo: [...user.bookIssueInfo],
    };
    res.send(details);
  } catch (e) {
    res.status(400).send(e);
  }
});

module.exports = router;
