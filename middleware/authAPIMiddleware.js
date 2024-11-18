const jwt = require("jsonwebtoken");

const authAPIMiddleware = (req, res, next) => {
  const token = req.header("Authorization");
  if (!token) {
    return res.sendStatus(401);
  }
  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified;
    next();
  } catch {
    res.sendStatus(401);
  }
};

module.exports = authAPIMiddleware;
