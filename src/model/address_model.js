const mongoose = require('mongoose')

const { types, required, string } = require('joi')

const addressSchema = new mongoose.Schema({
       user_id:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'user',
        required:true},

        addressData:[{
            name:{
                type:String,
                required:true
            },
            phone:{
                type:String,
                required:true
            },
            city:{
                type:String,
                required:true
            },
            state:{
                type:String,
                required:true
            },
            pincode:{
                type:Number,
                required:true
            },
            address:{
                type:String,
                required:true
            },
            locality:{
                type:String,
                required:true
            },
            status:{
                type:Boolean,
                default:false
            }
        }]
    
})

module.exports= mongoose.model('address',addressSchema)
