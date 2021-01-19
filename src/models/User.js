const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs')
require('../db/mongoose');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
    name:{
        type: 'string',
        trim: true,
        required: true
    },
    age: {
        type: 'number',
        required: true,
        valdate(value){
            if(value<18){
                throw new Error('value must be >18')
            }
        }
    },
    email: {
        type: 'string',
        required: true,
        lowercase: true,
        unique: true,
        validate(value){
            if (!validator.isEmail(value)){
                throw new Error('Please Enter valid email address!')
            }
        }
    },
    password: {
        type: 'string',
        required: true,
        trim: true,
        validate(value){
            if (value.includes('password')){
                throw new Error('Password should not contain "password" word')
            }
        }
    },
    //step1
    tokens: [{
        token :{
            type: 'string',
            required: true
        }
    }],
    avatar:{
        type : Buffer
    }
})

userSchema.virtual('tasks',{
    ref: 'Task',
    localField: '_id',
    foreignField: 'owner'
})

//step2
userSchema.methods.generateToken = async function(){
    const user = this;
    const token = await jwt.sign({_id:user._id.toString()}, process.env.TOKEN_SECRET_KEY);
    user.tokens = user.tokens.concat({token})
    await user.save()

    return token;
}

userSchema.methods.toJSON=function(){
    const user=this;
    const userObject = user.toObject()
    delete userObject.password
    delete userObject.tokens
    return userObject
}


userSchema.statics.findByCredential = async (email, password)=>{
    // console.log("findByCredential running")
    const user = await User.findOne({email});
    // console.log(user)

    if (!user){
        throw new Error("Unable to login!");
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch){
        throw new Error("invalid information!");
    }

    return user;
}

//mongoose middleware for hash password
userSchema.pre('save', async function (next){
    const user = this;

    if(user.isModified('password')){
        user.password = await bcrypt.hash(user.password, 8);
    }
    next();
})

const User = mongoose.model('User', userSchema)

module.exports = User