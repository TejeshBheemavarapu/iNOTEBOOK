const jwt = require("jsonwebtoken");

const auth = require("../routes/auth");

const jwt_secret = "Tejesh1234";

const fetchuser = (req, res, next) => {
  // Get the user from the jwt token and add id to req object

  const token = req.header("authtoken");

  if (!token) {
    return res.status(401).send({ error: "Please authenticate using a valid token" });
  }

  try {
    const data = jwt.verify(token, jwt_secret);
    req.user = data.user;
    next();
  } catch (error) {
    return res.status(401).send({ error: "Please authenticate using a valid token" });
  }
};
module.exports = fetchuser;
