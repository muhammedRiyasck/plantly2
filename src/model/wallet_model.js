const mongoose = require('mongoose');

const wallteSchema = new mongoose.Schema({

    user_id: {
        
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
        
    },

    balance: {

        type: Number,
        // required: true
        
    },
    transaction: [{
        
        amount: { type: Number },
        time: { type: Date, default: Date.now },
        creditOrDebit: { type: String, enum: ['credit', 'debit'] }

    }]

    
});

module.exports = mongoose.model('wallet', wallteSchema);
