const express = require('express');
const router = express.Router();
const MessageSchema = require('../models/Message');
const fetchuser = require('../middleware/fetchuser');
const { body, validationResult } = require('express-validator');







// ROUTE 1: Sending a new message using: POST: /api/message/send
router.post('/send/:id', fetchuser, [
    body('message', "Please Enter a valid Message").exists(),
], async (req, res) => {
    
    // Data Validation Errors (START)
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    // Data Validation Errors (END)



    new_message = await MessageSchema.create({
        sentBy: req.user.id,
        sentTo: req.params.id,
        msgcontent: req.body.message,
    });

    res.json(new_message);


    // console.log(new_message)


});





















































// ROUTE 2: Fetching all messages for a specific chat using: POST: /api/message/chat/:id
router.get('/chat/:id', fetchuser, async (req, res) => {

    // const messages = await MessageSchema.find({$or: [
    //  {$and: [ {sentTo: req.params.id}, {sentBy: req.user.id} ]},
    //  {$and: [ {sentBy: req.params.id}, {sentTo: req.user.id} ]}
    // ]});

    const messages = await MessageSchema.find({ $or: [
        { $and: [{ sentBy: req.user.id }, { sentTo: req.params.id }] },
        { $and: [{ sentBy: req.params.id }, {sentTo: req.user.id}] }
    ] })

    res.json(messages);
    console.log(`User Id: ${req.user.id}`, `Sent To Id: ${req.params.id}`);
});






































// ROUTE 3: Deleting a Message: DELETE: /api/message/delete/:id
router.delete('/delete/:id', fetchuser, async (req, res) => {
    const theMessage = await MessageSchema.findById(req.params.id);

    if (!theMessage) {
        return res.status(404).send('Cannot Find The Message To Be Deleted!');
    }

    if (theMessage.sentBy !== req.user.id) {
        return res.status(403).send('You Cannot Delete a message that you never sent');
    }
    
    await MessageSchema.findByIdAndDelete(req.params.id);

    res.json(theMessage);
    
});










































// ROUTE 4: Editing a Message: DELETE: /api/message/delete/:id
router.put('/edit/:id', fetchuser, async (req, res) => {
    const theMessage = await MessageSchema.findById(req.params.id);

    if (!theMessage) {
        return res.status(404).send('Cannot Find The Message To Be Edited!');
    }

    if (theMessage.sentBy !== req.user.id) {
        return res.status(403).send('You Cannot Edit a message that you never sent');
    }
    
    const new_message = await MessageSchema.findByIdAndUpdate(req.params.id, {msgcontent: req.body.msgcontent});
    await MessageSchema.findByIdAndUpdate(req.params.id, {isEdited: true})

    res.json(theMessage);
    
});





module.exports = router;
