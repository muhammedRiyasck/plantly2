const { required } = require('joi');
const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema({

    fullName:{
        type:String,
        required:true
    },
    mobile:{
        type:Number
        
    },
    email:{
        type:String,
        unique:true,
        required:true
    },
    password:{
        type:String,
        required:true
    },
   
    is_verified:{
        type:Boolean,
        default:false,
    },
    is_admin:{
        type:Boolean,
        default:false
    },
    refreshToken:{
        type:String
    },
    is_blocked:{
        type:Boolean,
        default:false
    },
    datejoined:{
        type:Date,
        default:Date.now()
    },
    refferal:{
        type:String,
        unique:true,
        required:true
    }
    
})

module.exports = mongoose.model('user', UserSchema);
