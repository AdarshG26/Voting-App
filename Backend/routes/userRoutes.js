const express = require('express');
const router = express.Router();
const User = require('../models/user');
const {jwtAuthMiddleware, generateToken} = require('../jwt');

// POST signup
router.post('/signup', async(req, res)=>{
    try{
        const data = req.body;       // Asssuming the request body contains user data               
        
        // Create a new User document using the mongoose model
        const newUser = new User(data);
        
        // Save the new User to the database
        const response = await newUser.save();
        console.log('Data saved');

        const payload = {
            id: response.id,
        }
        console.log(JSON.stringify(payload));
        
        const token = generateToken(payload);
        console.log('Token is: ', token);
        
        res.status(200).json({response: response, token: token});
    }
    catch(err){
        console.log(err);
        res.status(500).json({error: 'Internal server error'});
    }
})


// Login route
router.post('/login', async(req, res)=> {
    try {
        // Extract username and password from request body
        const {adharCardNumber, password} = req.body;

        // Find the user by usesrname in database
        const user = await User.findOne({adharCardNumber: adharCardNumber});

        // If user does not exist or password does not match, return error
        if(!user || !(await user.comparePassword(password))){
            return res.status(401).json({error: 'Invalid username or password'});
        }

        // generate token
        const payload = {
            id: user.id,
        }
        const token = generateToken(payload);

        // Return token as response
        res.json({token});
    } catch(err) {
        console.log(err);
        res.status(500).json({error: 'Internal server error'});
    }
})

// Get users
router.get('/', async(req, res)=>{
    try {
        const users = await User.find();
        return res.status(200).json(users);

    } catch(err) {
        console.log(err);
        res.status(500).json({error: 'Internal server error'});
    }
})


// Profile route
router.get('/profile', jwtAuthMiddleware, async(req, res)=>{
    try {
        const userData = req.user;
        const userId = userData.id;
        const user = await user.findById(userId);

        res.status(200).json({user})
    } catch(err) {
        console.log(err);
        res.status(500).json({error: 'Internal server error'});
    }
})


// PUT
router.put('/profile/password', jwtAuthMiddleware, async (req, res)=>{
    try {
        const userId = req.user.id;                 // Extract the id from the token
        const {currentPassword, newPassword} = req.body;        //Extract current and new password from request body

        // Find the user by userId
        const user = await User.findById({userId});

        // If password does not match, return error
        if(!(await user.comparePassword(currentPassword))){
            return res.status(401).json({error: 'Invalid password'});
        }

        // Update the user's password
        user.password = newPassword;
        await user.save();

        console.log('Password updated');
        res.status(200).json({message: 'Password updated'});
    } catch (err){
        console.log(err);
        res.status(500).json({error: 'Internal server error'});
    }
})


module.exports = router;