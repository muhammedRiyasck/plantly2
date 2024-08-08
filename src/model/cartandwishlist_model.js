const { required } = require('joi')
const mongoose = require('mongoose')

const cartSchema = new mongoose.Schema({

    user_id:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'user',
        required:true
    },
    products:[{
        product_id:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'product',
        required:true

    },
    price:{
        type:Number,
        required:true
    },
    offerPrice:{
        type:Number,
    },
    quantity: {
        type: Number,
        required: true,
    }

    }],

    totalCartPrice:{

        type:Number,
        required : true

    },
    coupenDiscount: {
        
        type: Number,
        required: true,
        default: 0

    },

    percentage: {
        
        type: Number,
        required: true,
        default: 0
    },
    totalSaved:{
        type:Number,
        default:0
    },



},{timestamps:true})

const cart = mongoose.model('cart',cartSchema)

const wishlistSchema = new mongoose.Schema({

    user_id:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'user',
        require:true
    },
    products: [{
        
        product_id: {
           
            type: mongoose.Schema.Types.ObjectId,
            ref: 'product',
            required:true
        }

    }]

} ,  { timestamps:true })

const wishlist = mongoose.model('wishlist',wishlistSchema)

module.exports={
    cart,
    wishlist
}
