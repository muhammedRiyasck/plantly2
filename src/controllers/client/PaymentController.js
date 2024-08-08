const crypto = require("crypto");
const User = require('../../model/user_model') 
const {cart} = require('../../model/cartandwishlist_model')
const Order = require('../../model/order_model')
const Razorpay = require("razorpay");

require("dotenv").config();

const Instance = new Razorpay({

  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_SECRET_KEY,
  
});

const verifyPayment = async (req,res,next)=>{
    try {
        console.log('verify payment route reacheddd!!'); 
        const {response,order}=req.body;
        const userId = req.session.user._id
        const cartData = await cart.find({user_id:userId})
  
        let hmac=crypto.createHmac('sha256',process.env.RAZORPAY_SECRET_KEY);
        hmac.update(response.razorpay_order_id + '|' + response.razorpay_payment_id);
        hmac=hmac.digest('hex'); 
  
        if(hmac == response.razorpay_signature){
            
            const orderData=await Order.findOne({_id:order.receipt},{products:1});
          
            for(const item of orderData.products){
              await Order.findOneAndUpdate(
                { _id: order.receipt, 'products.product_id': item.product_id },
                {
                    $set: {
                        'products.$.productStatus': 'placed',
                        orderStatus: 'placed'
                    }
                }
            );
               
            }
            if(cartData){
            await cart.deleteOne({ user: userId });
            }
            res.json({statusChanged:true});
        
        }
  
    } catch (error) {
       next(error)
    }
  }

 const retryPayment = async(req,res)=>{
            try {
              
              let totalAmount = req.body.amount
              let orderID = req.body.order_Id
              req.session.user.amount = totalAmount
              req.session.user.order_Id = orderID
              const orderedData =await Order.findOne({order_Id:orderID})
     
              let options = {  amount:totalAmount * 100,
                       currency: 'INR',
                       receipt: ''+orderedData._id,
                     }
       
               Instance.orders.create(options, async function (err, order) {
                       if(err){
                         console.log("error:",err);
                     }
               return res.json({razorpay:true,order})
                    
             })
            } catch (error) {
              console.log(error)
            }
  }
  

module.exports={
  verifyPayment,
  retryPayment
}
