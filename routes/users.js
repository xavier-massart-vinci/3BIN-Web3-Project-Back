const router = require('express').Router();
const User = require('../models/Users');

// GET All /users
router.get('/', (req, res) => {
    User.find().then((users) => {
        res.json(users);
    }).catch(() => {
        res.sendStatus(500);
    });
});


// GET One /users/:id
router.get('/:id', (req, res) => {
    User.findById(req.params.id).then((user) => {
        res.json(user);
    }).catch(() => {
        res.sendStatus(404);
    });
});


module.exports = router;
