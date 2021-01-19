const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async(req, res, next)=>{
    const token = req.header('Authorization').replace('Bearer ', "");
    const decoded = jwt.verify(token, "taskmanagerisawesomeproject");
    const user = await User.findOne({_id: decoded, 'tokens.token' : token});

    if(!user){
        throw new Error()
    }
    req.user = user;
    req.token = token;
    next();
}

module.exports = auth;