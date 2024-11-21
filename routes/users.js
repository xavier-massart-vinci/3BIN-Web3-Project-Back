const router = require("express").Router();
const User = require("../models/Users");
const authAPIMiddleware = require("../middleware/authAPIMiddleware");

// GET All /users
router.get("/", authAPIMiddleware, (req, res) => {
  User.find()
    .select("-friends")
    .then((users) => {
      res.json(users);
    })
    .catch(() => {
      res.sendStatus(500);
    });
});

// GET One /users/:id
router.get("/:id", authAPIMiddleware, (req, res) => {
  User.findById(req.params.id)
    .then((user) => {
      res.json(user);
    })
    .catch(() => {
      res.sendStatus(404);
    });
});

module.exports = router;
