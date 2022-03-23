const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    fname:{type:String, required:true, trim:true},
    lname:{type:String, required:true, trim:true},
    mobile:{type:String, required:true, unique:true},
    password:{type:String, required:true},
    email:String,
    role:{type:Number, default:0},
    cart:{type:Array, default: []},
    userImage:String,
    createdAt:{type:Date, default:Date.now()},
    updateAt: {type:Date, default:Date.now()}
})

const userModel = mongoose.model('User', userSchema)
module.exports = userModel