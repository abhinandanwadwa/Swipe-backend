const jwt = require('jsonwebtoken');

const JWT_SECRET = "AbhiIsAVerySexyB$oy";   // Exactly as the name suggests: "Secret key, that we'll use while signing the auth-token"


const fetchuser = (req, res, next) => {

    // Get the user from the jwt token and add "id" to the "req" object so that the "id" is accessible to the "next" function by just doing: (req.body.id)
    const token = req.header('auth-token');  // We will store the auth-token in the header of the user
    if(!token){
        // When the token is not present in the header of the user
        return res.status(401).send({error: "Please authenticate using a valid token"})
    }




    // If the token is present in the header of the user
    try {
        const data = jwt.verify(token, JWT_SECRET);
        req.user = data.user;   // Created a JSON Object in the request header called "user" and added a value of "id(data.user.id)"
        
        // Calling the "next(async(req, res) => {}) function"
        next();

    } catch (error) {
        return res.status(401).send({error: "Please authenticate using a valid token"});
    }
    





    
}

module.exports = fetchuser;