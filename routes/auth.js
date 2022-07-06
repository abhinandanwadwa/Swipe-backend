const express = require('express');
const router = express.Router();
const UserSchema = require('../models/User');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

const JWT_SECRET = "AbhiIsAVerySexyB$oy";





















// ROUTE 1: Add a new user to the database using: POST: /api/auth/createuser. Login Not Required
router.post('/createuser', [
    body('name', "Name must be at least 4 characters long").isLength({ min: 4 }),
    body('email', "Please Enter a valid Email").isEmail(),
    body('username', "Username must be at least 5 characters long").isLength({ min: 5 }),
    body('password', "Password must be at least 6 characters long").isLength({ min: 6 }),
], async (req, res) => {

    // Data Validation Errors (START)
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    // Data Validation Errors (END)


    // Checking if the user with the same email or username already exists(START)
    let new_user = await UserSchema.findOne({email: req.body.email});
    if(new_user){
        return res.status(400).json({error: "Sorry, a user with this email id already exists"});
    }
    
    new_user = await UserSchema.findOne({username: req.body.username});
    if(new_user){
        return res.status(400).json({error: "Sorry, a user with this username already exists"});
    }
    // Checking if the user with the same email or username already exists(END)





    // Storing the user into the database (START)
    const salt = await bcrypt.genSalt(10);
    const hashedPass = await bcrypt.hash(req.body.password, salt);

    new_user = await UserSchema.create({
        name: req.body.name,
        username: req.body.username,
        email: req.body.email,
        password: hashedPass,
    })
    // Storing the user into the database (END)

    // Initialising the JWT Signature (START)
    const payload = {
        user: {
            id: new_user._id
        }
    };

    var authtoken = jwt.sign(payload, JWT_SECRET);
    // Initialising the JWT Signature (END)

    res.json({authtoken});
});










































// ROUTE 2: Authenticate a user using: POST: /api/auth/login. Login Not Required
router.post('/login', [
    body('username', "Enter a valid username").isLength({ min: 5 }),
    body('password', "Password cannot be blank").exists(),
], async (req, res) => {

    // Data Validation Errors (START)
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    // Data Validation Errors (END)


    // Checking if the email exists in the db (START)
    let user = await UserSchema.findOne({username: req.body.username});
    if(!user){
        return res.status(401).json({error: "Incorrect Credentials"})
    }
    // Checking if the email exists in the db (END)


    // Checking if the password matches the password in the db (START)
    const passwordCompare = await bcrypt.compare(req.body.password, user.password);
    if(!passwordCompare){
        return res.status(401).json({error: "Incorrect Credentials"});
    }
    // Checking if the password matches the password in the db (END)


    // If the password and the username matches, giving them the authtoken (START)
    const payload = {
        user: {
            id: user._id
        }
    }

    // Signing the JWT(START)
    const authtoken = jwt.sign(payload, JWT_SECRET);
    res.json({authtoken});
    // Signing the JWT(END)

    // If the password and the username matches, giving them the authtoken (END)

    


});




module.exports = router;