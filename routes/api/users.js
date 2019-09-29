const express = require('express');
const router = express.Router();
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
const { check, validationResult } = require('express-validator');
const User = require('../../models/User');

// @route         GET api/users
// @description   test route
// @access        Public
router.get('/', (req, res) => res.send('User route'));

// @route         POST api/users
// @description   register user
// @access        Public
router.post('/', [
  check('name', 'Name is required')
    .not()
    .isEmpty(),
  check('email', 'Please include your email address').isEmail(),
  check('password', 'Please enter a password with at least 6 characters')
    .isLength({ min: 6 })
],
  async (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });  // 400 means bad request error
    }
    // doing this so we don't have to preface everything with "req.body."
    const { name, email, password } = req.body; 
    try {
      let user = await User.findOne({ email });

      if (user) {
         return res.status(400).json({ errors: [{ msg: 'user already exists' }] });
      }
      
      const avatar = gravatar.url(email, {
        s: '200',
        r: 'pg',
        d: 'mm'  
      });

      user = new User({
        name,
        email,
        avatar,
        password
      });

      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
      await user.save();

      const payload = {
        user: {
          id: user.id
        }
      }

      // sign the token, pass in payload, pass in secret, expiration (optional)
      // inside the callback, if we don't get an error, we send back the token
      jwt.sign(
        payload, 
        config.get('jwtSecret'),
        { expiresIn: 720000 },
        (err, token) => {
          if (err) throw err;
          res.json({ token });
        });

    } catch(err) {
      console.log(err.message);
      res.status(500).send('Server error');
    };
  }
);


module.exports = router;