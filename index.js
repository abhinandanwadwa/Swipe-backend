const express = require('express');
const connectToMongo = require('./db');
const auth = require('./routes/auth');
const cors = require('cors');



const app = express();
connectToMongo();

app.use(express.json());
app.use(cors());



app.use('/api/auth', auth);

app.get('/', (req, res) => {
    res.send('ok!')
    console.log("ok")
});



const port = 5000;
app.listen(port, () => {
    console.log(`Server Started successfully at port ${port}`)
})