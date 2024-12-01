const jwt = require('jsonwebtoken');

const jwtAuthMiddleware = (req, res, next) =>{

    // First check request headers has authorisation or not
    const authorization = req.headers.authorization;
    if(!authorization){
        return res.status(401).json({error: 'Token not found'});
    }

    // Extract the JWT token from the request headers
    const token = req.headers.authorization.split(' ')[1];
    if(!token){
        return res.status(401).json({error: 'Unauthorized'});
    }

    try {
        // Verify JWT token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Attach user information to the request object
        req.user = decoded;
        next();
    } catch(err) {
        console.log(err);
        res.status(401).json({error: 'Invalid token'});
    }
}


// Function to generate JWT token
const generateToken = (userData)=> {
    // Generate a new JWT token using user data
    return jwt.sign(userData, process.env.JWT_SECRET, {expiresIn: '30h'});
}


module.exports = {jwtAuthMiddleware, generateToken}
