const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({

    name: { type: String, required: true },

    description: { type: String, required: true },

    price: { type: Number, min: 0, required: true },

    category_id: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'category' },
    
    // createdAt: { type: Date, default:Date.now() },
    
    status: { type: Boolean, default: true },
    
    stock: { type: Number, default: 1 },

    images: { type: Array, required: true },

    discount_price: { type: Number, default: 0 },

    discount: { type: Number, default: 0 },
    
    
},{timestamps:true});

module.exports = mongoose.model("product", productSchema); 
