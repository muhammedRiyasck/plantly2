const {wishlist,cart}= require('../../model/cartandwishlist_model')
const Coupen = require('../../model/coupen_model')
const Product = require('../../model/products_model')
const Category = require('../../model/category_model')
const Address = require('../../model/address_model')
const Wallet = require('../../model/wallet_model')
const User = require('../../model/user_model')


const loadChekout = async(req,res,next)=>{
    try {
        if(req.session.user){
            const userId = req.session.user._id
            const cartData = await cart.findOne({user_id:userId}).populate('products.product_id')

            const userData = await User.findOne({_id:userId})
   
            if(cartData.products.length>=1){
                let totalAmount
                let amount = await cart.findOne({user_id:userId},{totalCartPrice:true})
                let taxAmount =0
                if(cartData.coupenDiscount<0){
                   totalAmount = Math.round(amount.totalCartPrice+taxAmount)
                    
                }else{
                     totalAmount = Math.round(amount.totalCartPrice)
                }
                
            let coupenData = await Coupen.find({status:true,used:false})
            let userWallet= await Wallet.findOne({user_id:req.session.user._id})
            console.log(userWallet?.balance,'wlaatatet')
            const address = await Address.findOne({user_id:userId})
            
            const message = req.flash('flash')
            const coupenDiscount = req.flash('coupenDiscount')
            const coupenSpan = req.flash('coupenSpan')
            const coupen_id = req.flash('coupen_id')
            res.render('Checkout',{userlogdata:req.session.user,address,userId,message,cartData,taxAmount,totalAmount,userData,coupenData,coupenDiscount,coupenSpan,userWallet,coupen_id})

            }else{
                req.flash('message','please add product to cart')
                res.redirect('/cart')
            }
        }else{
            req.flash('message','please login first. to go chekout')
            res.redirect('/login')
        }
    } catch (error) {
        next(error)
    }
}



module.exports={
    loadChekout,
}
