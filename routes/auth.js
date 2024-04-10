const express = require("express");
const User = require("../modules/User");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const fetchuser = require("../middleware/fetchuser");
const { body, matchedData, validationResult } = require("express-validator");

const jwt_secret = "Tejesh1234";

// create a user using :POSt "/api/auth/createuser",no login require
router.post(
  "/createuser",
  [
    body("name", "Enter a valid name").isLength({ min: 3 }).notEmpty().escape(),
    body("email", "Enter a valif email").isEmail(),
    body("password", "Password must br atleast 5 character").isLength({
      min: 5,
    }),
  ],
  async (req, res) => {
    let success  = false; 
    //if thre are error ,return bad request and the errors
    const error = validationResult(req);
    if (!error.isEmpty()) {
      success = false;
      return res.status(400).json({ errors: error.array() });
    }
    // check wheather the user with this email exits already
    try {
      let user = await User.findOne({ email: req.body.email });
      if (user) {
        success = false;
        return res
          .status(400)
          .json({ error: "sorry a user with this email existed already" });
      }
      const salt = await bcrypt.genSalt(10);

      const secPass = await bcrypt.hash(req.body.password, salt);
      user = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: secPass,
      });
      const data = {
        user: {
          id: user.id,
        },
      };
      const authToken = jwt.sign(data, jwt_secret);
      success =true;
      res.json({success, authToken });
    } catch (error) {
      console.error(error.message);
      res.status(500).send("some Error occured");
    }
  }
);
// Authenticate user using :POSt "/api/auth/login",no login require
router.post(
  "/login",
  [
    body("email", "Enter a valif email").isEmail(),
    body("password", "Password must br atleast 5 character").exists(),
  ],
  async (req, res) => {
    let success = false;
    const error = validationResult(req);
    if (!error.isEmpty()) {
      return res.status(400).json({ errors: error.array() });
    }
    const { email, password } = req.body;
    try {
      const user = await User.findOne({ email });
      if (!user) {
        success = false;
        return res
          .status(400)
          .json({ error: "Please try to login with corrent credentials" });
      }
      const passwordCompare = await bcrypt.compare(password, user.password);
      if (!passwordCompare) {
        success = false;
        return res
          .status(400)
          .json({ error: "Please try to login with corrent credentials" });
      }
      const data = {
        user: {
          id: user.id,
        },
      };
      const authtoken = jwt.sign(data, jwt_secret);
      success = true;
      
      res.json({ success , authtoken });
    } catch (error) {
      console.error(error.message);
      res.status(500).send("internal server error ");
    }
  }
);
// Get a user using :GET "/api/auth/getuser",login require

router.post("/getuser", fetchuser, async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId).select("-password");
    res.send(user);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("internal server error ");
  }
});

module.exports = router;
