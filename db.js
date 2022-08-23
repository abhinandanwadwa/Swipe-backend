const mongoose = require('mongoose');
<<<<<<< HEAD
const mongoURI = "mongodb+srv://abhinandan__wadhwa:c8pvRZw55NhpZEpV@cluster0.rt1oy.mongodb.net/?retryWrites=true&w=majority";
=======
const mongoURI = "mongodb://localhost:27017/swipe";
>>>>>>> 609f628aad739fb2b60d169fcb1a48aa5429e84d

const connectToMongo = () => {
    mongoose.connect(mongoURI, { dbName: 'swipe' }, (err) => {
        console.log("Connected To Mongo Successfully!!");
        console.log(err);
    })
}

<<<<<<< HEAD
module.exports = connectToMongo;
=======
module.exports = connectToMongo;
>>>>>>> 609f628aad739fb2b60d169fcb1a48aa5429e84d
