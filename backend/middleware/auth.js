const { sign, verify } = require("jsonwebtoken");
exports.createToken = (email) => {
  const token = sign({ email: email }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRY_TIME,
  });
  return token;
};
exports.validateToken = async (req, res, next) => {
  const token = req.headers.auth;
  if (accessToken === undefined) {
    res.status(401).json({
      status: 401,
      success: false,
      message: "Token doesn't exists",
    });
  } else if (!accessToken) {
    return res
      .status(404)
      .json({ status: 401, success: false, message: "Token doesn't exists" });
  }
  try {
    const validateToken = verify(token, process.env.JWT_SECRET);
    if (validateToken) {
      res.locals.email = validateToken.email;
      return next();
    }
  } catch (error) {
    res.status(401).send({
        status:401,
        success:false,
        message: "User not authorized" });
  }
};