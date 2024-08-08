// const { ref, required } = require('joi')
const { required } = require('joi')
const mongoose = require('mongoose')

const OrderSchema  = mongoose.Schema({

    user_id:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'user',
        required:true
    },
    orderAmount:{
        type:Number,
        required:true
    },
    order_Id:{
        type:String,
        required:true
    },
    payment:{
        type:String,
        required:true
    },
    orderDate:{
        type:Date,
        required:true,
        default:Date.now(),
    },
    deliveryAddress:{
        name:{type:String,required:true},
        phone:{type:Number,required:true},
        city:{type:String,required:true},
        state:{type:String,required:true},
        pincode:{type:Number,required:true},
        address:{type:String,required:true},
        locality:{type:String,required:true}
    },
    percentage:{
        type:Number,
        default:0
    },
    products:[{
        product_id:{
            type:mongoose.Schema.Types.ObjectId,
            ref:'product',
            required:true
        },
        quantity:{
            type:Number,
            required:true
        },
        price:{
            type:String,
            required:true
        },
        productStatus:{
            type:String,
            required:true,
            enum:['pending','placed','shipped','delivered','cancelled','returned'],
            default:'pending'
        },
        canceled: { type: Boolean, default: false },
        
        reason: { type: String, default: '' },
    
        retruned: { type: Boolean, default: false },
        
    }],
    orderStatus:{
        type:String,
        enum:['pending','placed','shipped','delivered','cancelled','returned'],
        required:true,
        default:'pending'
    },
    // deliveryCharge:{
    //     type:Number,
    //     required:true
    // },
    totalSaved:{
        type:Number,
        required:false,
        default:0
    },
    
   


})

module.exports = mongoose.model('order',OrderSchema)
