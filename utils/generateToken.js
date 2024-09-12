const jwt = require("jsonwebtoken")
const generateToken = (user)=>{
    return jwt.sign({email:user.email,id:user._id},process.env.SESSION_SECRET, {
        expiresIn: "1d",
    })
}
module.exports.generateToken = generateToken