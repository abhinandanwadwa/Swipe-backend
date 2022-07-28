const express = require('express');
const router = express.Router();
const UserSchema = require('../models/User');
const FriendsSchema = require('../models/Friends');
const FriendRequestNotificationsSchema = require('../models/FriendRequestNotifications');
const ChatNotificationsSchema = require('../models/ChatNotifications');
const MessageSchema = require('../models/Message');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
const fetchuser = require('../middleware/fetchuser');

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














































// ROUTE 3: Getting all the users from the db. Login Required
router.get('/getallusers', fetchuser, async (req, res) => {
    const users = await UserSchema.find({'_id': {$ne: req.user.id}});
    res.json(users);
})













































// ROUTE 4: Getting a specific user from the db. Login Required
router.get('/finduser/:id', async (req, res) => {
    const users = await UserSchema.findOne({'_id': req.params.id});
    res.json(users);
})







































// ROUTE 5: Getting a logginIn user details from the db. Login Required
router.get('/getmydetails', fetchuser, async (req, res) => {
    const userId = req.user.id;
    const theUser = await UserSchema.findOne({_id: userId});
    console.log(theUser);
    res.send(theUser);
});















































// ROUTE 6: Update Avatar URL in the db. Login Required
router.post('/avatarchange', fetchuser, async (req, res) => {
    console.log("I'm here mann!!");
    const url = req.body.url;
    const userId = req.user.id;

    const updatedUser = await UserSchema.findByIdAndUpdate(userId, {pfpuri: url});
    res.send('Done!');

})
















































// ROUTE 7: Update User Details (name and email) in the db. Login Required
router.put('/updateuser', [
    body('name', "Name must be at least 4 characters long").isLength({ min: 4 }),
    body('email', "Please Enter a valid Email").isEmail(),
], fetchuser, async (req, res) => {

    // Data Validation Errors (START)
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
    }
    // Data Validation Errors (END)


    const update_user = await UserSchema.findByIdAndUpdate(req.user.id, {name: req.body.name, email:req.body.email});

    const updated_user = await UserSchema.findById(req.user.id);
    res.json(updated_user);

})






























































// ROUTE 8: Sending Friend Request to a user. Login Required
router.post('/sendfriendrequest/:id', fetchuser, async (req, res) => {

    const sex = await FriendsSchema.findOne({ whoSent: req.user.id, toWhom: req.params.id });
    if (sex) {
        console.log("Friend Request Already Sent");
        return res.json({success: false});
    }

    const sex2 = await FriendsSchema.findOne({ whoSent: req.params.id, toWhom: req.user.id });
    if (sex2) {
        console.log("He has sent you the friend request");
        return res.json({success: false});
    }


    if (req.params.id === req.user.id) {
        console.log("You can not send friend request to yourself");
        return res.json({success: false});
    }


    FriendsSchema.create({ whoSent: req.user.id, toWhom: req.params.id }, () => {
        console.log("Friend Request Sent");
        res.json({success: true});
    })

})
















































































// ROUTE 9: Finding all of my friends. Login Required
router.get('/findallfriends/:query', fetchuser, async (req, res) => {

    let ans = [];

    if (req.params.query === 'noparams') {
        const myFriends = await FriendsSchema.find({ $and: [ {$or: [{whoSent: req.user.id}, {toWhom: req.user.id}]}, {isAccepted: true} ]});


        for (friend of myFriends) {
            if (friend.whoSent === req.user.id) {
                let sexyFriend = await UserSchema.findById(friend.toWhom);
                ans.push(sexyFriend);
            }
            else {
                let sexyFriend = await UserSchema.findById(friend.whoSent);
                ans.push(sexyFriend)
            }
        }
        res.send(ans);
    }


    else {
        console.log("Searching...");
        
        const userRegex = new RegExp(req.params.query, 'i');

        const searchedFriends = await UserSchema.find( { $or: [
            { name: userRegex },
            { username:  userRegex },
            { email: userRegex }
        ] })
        res.send(searchedFriends);
    }
})















































































// ROUTE 10: Getting all of my pending friend requests. Login Required
router.get('/pendingrequest/:id', fetchuser, async (req, res) => {
    const pending = await FriendsSchema.findOne({ $and: [ { whoSent: req.user.id }, {toWhom: req.params.id}, {isAccepted: false} ]});
    if (pending) {
        res.send(true);
    }
    else {
        res.send(false);
    }
})

























































// ROUTE 11: Getting all the users from the db except the friends. Login Required
router.get('/getallwofriends', fetchuser, async (req, res) => {
    const users = await UserSchema.find({'_id': {$ne: req.user.id}});
    
    let notFriends = [];


    for (const element of users) {
        const isInTheFriendsDbWithMe = await FriendsSchema.findOne({ $or: [
            { $and: [{ whoSent: req.user.id }, { toWhom: element._id }] }, { $and: [{ whoSent: element._id }, { toWhom: req.user.id }] }
        ] });

        if (isInTheFriendsDbWithMe) {
            if (isInTheFriendsDbWithMe.isAccepted === false) {
                notFriends.push(element);
            }
        }

        else {
            notFriends.push(element);
        }
    }
    res.json(notFriends);
    
    // users.forEach(element => {
    //     const isInTheFriendsDbWithMe = await FriendsSchema.findOne({ $or: [
    //         { $and: [{ whoSent: req.user.id }, { toWhom: element._id }] }, { $and: [{ whoSent: element._id }, { toWhom: req.user.id }] }
    //     ] });

    //     if (isInTheFriendsDbWithMe) {
    //         if (isInTheFriendsDbWithMe.isAccepted === false) {
    //             notFriends.push(element);
    //         }
    //     }

    //     else {
    //         notFriends.push(element);
    //     }


    // });
})



















































// ROUTE 12: // Checking received pending friend requests. Login Required
router.get('/receivedpendingrequest/:id', fetchuser, async (req, res) => {
    const sex = await FriendsSchema.findOne({ $and: [{ whoSent: req.params.id }, { toWhom: req.user.id }, { isAccepted: false }] })
    
    if (sex) {
        return res.send(true);
    }
    else {
        return res.send(false);
    }
});




















































// ROUTE 13: // Accepting received pending friend requests. Login Required
router.put('/acceptrequest/:id', fetchuser, async (req, res) => {
    const request = await FriendsSchema.findOneAndUpdate({whoSent: req.params.id, toWhom: req.user.id}, {isAccepted: true})

    res.send("Accepted!!");
});






























































// ROUTE 14: // Deleting received pending friend requests. Login Required
router.delete('/declinerequest/:id', fetchuser, async (req, res) => {
    const request = await FriendsSchema.findOneAndDelete({whoSent: req.params.id, toWhom: req.user.id});

    res.send("Declined");
});





















































// ROUTE 15: Checking if the person is my friend or not. Login Required
router.get('/isfriend/:id', fetchuser, async (req, res) => {
    const pending = await FriendsSchema.findOne({ $or: [
        {$and: [ { whoSent: req.user.id }, {toWhom: req.params.id}, {isAccepted: true} ]},
        {$and: [{ whoSent: req.params.id }, { toWhom: req.user.id }, {isAccepted: true}]}
    ]});



    if (pending) {
        res.send(true);
    }
    else {
        res.send(false);
    }
})

































































// ROUTE 16: Deleting a Friend. Login Required
router.delete('/deletefriend/:id', fetchuser, async (req, res) => {
    const fr = await FriendsSchema.findOneAndDelete({ $or: [
        { $and: [{ whoSent: req.params.id }, { toWhom: req.user.id }] },
        { $and: [{ whoSent: req.user.id }, { toWhom: req.params.id }] }
    ] })



    res.json({sentById: req.user.id, receivedById: req.params.id});
})
























































// ROUTE 17: Sending Friend Request Notification. Login Required
router.post('/sendfriendreqnoti/:id', (req, res) => {
    FriendRequestNotificationsSchema.create({ user: req.params.id }, () => {
        // console.log("Notification Sent!!");
        res.send('Notification to the user with the id: '+ req.params.id + 'sent');
    })
})
















































// ROUTE 18: Calculating Friend Request Notification (if any). Login Required
router.get('/nooffrnoti', fetchuser, async (req, res) => {
    const frnoti = await FriendRequestNotificationsSchema.find({user: req.user.id, isread: false});

    let number = 0;

    frnoti.forEach(element => {
        number++;
    });


    res.json({number: number});
})
















































// ROUTE 18: Marking all the Friend Requests as seen (if any). Login Required
router.put('/markasseen', fetchuser, async (req, res) => {
    const frnoti = await FriendRequestNotificationsSchema.updateMany({user: req.user.id}, {isread: true});
    res.json({success: true});
})






























































// ROUTE 18: Sending Chat Notification. Login Required
router.post('/sendchatnotification/:id', fetchuser, async (req, res) => {
    ChatNotificationsSchema.create({ whoSent: req.user.id, toWhom: req.params.id }, () => {
        res.json({success: true})
    });
})






























































// ROUTE 19: Calculating the number of Chat Notification Unseen. Login Required
router.get('/calcnoofchatnoti', fetchuser, async (req, res) => {
    const allchatnoti = await ChatNotificationsSchema.find({ toWhom: req.user.id, isSeen: false });

    let nocn = 0;

    allchatnoti.forEach(element => {
        nocn++;
    });

    res.json({ number: nocn });
})






























































// ROUTE 20: Marking the notifications as seen. Login Required
router.delete('/markseen/:id', fetchuser, async (req, res) => {
    const chatnotis = await ChatNotificationsSchema.deleteMany({ whoSent: req.params.id, toWhom: req.user.id });
    res.json({ success: true });
})





























































// ROUTE 21: Calculating the number of Chat Notification Unseen Per User. Login Required
router.get('/calcnoofchatnoti/:id', fetchuser, async (req, res) => {
    const allchatnoti = await ChatNotificationsSchema.find({ whoSent: req.params.id, toWhom: req.user.id, isSeen: false });

    let nocn = 0;

    allchatnoti.forEach(element => {
        nocn++;
    });

    res.json({ number: nocn });
})































































// ROUTE 22: Sorting Users with respect to date they joined. Login Required
router.get('/sort', fetchuser, async (req, res) => {
    // UserSchema.find({  }).sort('-timestamp').exec((err, docs) => { 
    //     res.json(docs);
    //  });


    let all_messages = await MessageSchema.find({ $or: [{ sentBy: req.user.id }, { sentTo: req.user.id }] }).sort('-timestamp');

    let user_order_id = [];

    for (message of all_messages) {
        if (message.sentBy === req.user.id) {
            let the_user = await UserSchema.findById(message.sentTo);
            if (user_order_id.indexOf(the_user.id) === -1) {
                user_order_id.push(the_user.id);
                // console.log("The Fuck mann");
                // console.log(user_order_id.indexOf(the_user_id) !== -1)
            }
            // console.log(the_user.id);
        }
        else {
            let the_user = await UserSchema.findById(message.sentBy);
            if (the_user) {
                if (user_order_id.indexOf(the_user.id) === -1) {
                    user_order_id.push(the_user.id);
                    // console.log("The Fuck mann");
                }
            }
        }
    }

    let temp = [];
    const all_friends = await FriendsSchema.find({ $and: [{$or: [{ whoSent: req.user.id }, { toWhom: req.user.id }]}, {isAccepted: true}] });

    for (friend of all_friends) {
        if (friend.whoSent === req.user.id) {
            let friend_user = await UserSchema.findById(friend.toWhom);
            if (user_order_id.indexOf(friend_user.id) === -1) {
                user_order_id.push(friend_user.id);
            }
        }

        else {
            let friend_user = await UserSchema.findById(friend.whoSent);
            if (user_order_id.indexOf(friend_user.id) === -1) {
                user_order_id.push(friend_user.id);
            }
        }
    }

    let ans = [];

    for (user_id of user_order_id) {
        let sexy_user = await UserSchema.findById(user_id)
        ans.push(sexy_user);
    }

    res.json(ans);
})





















































































// ROUTE 23: Coming Online. Login Required
router.put('/online', fetchuser, async (req, res) => {
    await UserSchema.findByIdAndUpdate(req.user.id, { isOnline: true });
    res.send('done');
})










































































// ROUTE 24: Going Offline. Login Required
router.put('/offline', fetchuser, async (req, res) => {
    await UserSchema.findByIdAndUpdate(req.user.id, { isOnline: false });
    res.send('done');
})



module.exports = router;