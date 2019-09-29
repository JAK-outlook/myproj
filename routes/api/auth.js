const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
const { check, validationResult } = require('express-validator');

// @route         GET api/auth
// @description   test route
// @access        Public
router.get('/', auth, async (req, res) => {
  try {
    const user = await (User.findById(req.user.id)).select('-password');
    res.json(user);
  } catch(err) {
    console.error(err.message);
    res.status(500).send('Server malfunction');
  }
});

// @route         POST api/auth
// @description   authenticate user and get token
// @access        Public
router.post('/',
  [
    check('email', 'Please include your email address').isEmail(),
    check('password', 'Password required').exists()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });  // 400 means bad request error
    }
    // doing this so we don't have to preface everything with "req.body."
    const { email, password } = req.body; 
    try {
      let user = await User.findOne({ email });
      if (!user) {
         return res.status(400).json({ errors: [{ msg: 'invalid credentials' }] });
      }
      
      // compare returns a promise so 'await'
      const isMatch = await bcrypt.compare(password, user.password); 
      if (!isMatch) {
        return res.status(400).json({ errors: [{ msg: 'invalid credentials' }] });
      }
     
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