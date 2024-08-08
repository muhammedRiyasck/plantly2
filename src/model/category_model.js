const mongoose = require('mongoose')

const CategorySchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
        unique:true,
    },

    Listed:{
        type:Boolean,
        required:true,
        default:true
    },
})

module.exports = mongoose.model('category',CategorySchema)
