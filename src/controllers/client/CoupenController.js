const Address = require("../../model/address_model");

//  Import User Modal :-
const User = require("../../model/user_model");

//  Import Product Modal :-
const Product = require("../../model/products_model");

//  Import Category Modal :-
const Category = require("../../model/category_model");

//  Import Order Modal :-
const Order = require("../../model/order_model");

//  Import Cart Modal :-
const {cart} = require("../../model/cartandwishlist_model");

//  Import Wallet Model :-
const Wallet = require("../../model/wallet_model");

//  Coupen Modal :-
const Coupen = require('../../model/coupen_model');

const loadCoupen = async (req, res , next) => {
    
    try {
        
        const categoryData = await Category.find({ is_Listed: true });

        if (req.session.user) {

            const page = parseInt(req.query.page)||1
            const limit = 6
            const skip = (page-1)*limit

            const [coupenData,coupenCount]= await Promise.all([
                Coupen.find({ status: true,used:false }).skip(skip).limit(limit),
                Coupen.countDocuments({status:true})
            ])
            const totalPages = Math.ceil(coupenCount/limit)
            const msg = req.flash('flash')
            
            res.render("Coupen", {
                userlogdata: req.session.user,
                categoryData,
                coupenData,
                totalPages,
                currentPage:page,
                msgg: msg });

        } else {

            res.redirect('/login');

        }
        
    } catch (error) {

        next(error,req,res);

        
    }

};

const checkValidCoupen = async (req, res , next) => {
    
    try {

      
        const inpValue = req.body.id
        console.log(inpValue)
        const checkCoupen = await Coupen.findOne({ coupen_id: inpValue,used:false });

        if (checkCoupen) {
            console.log(true)
            res.send({ succuss: true })

        } else {
            

            res.send({ succuss: false })
            console.log('false')
        }

    } catch (error) {

        next(error,req,res);

        
    }

};

const useCoupen = async (req, res , next) => {
    
    try {

        const coupenIdd = req.body.coupen;

        const coupen = await Coupen.findOne({coupen_id : coupenIdd, status: true });
        
        if (coupen) {
            
            const cartData = await cart.findOne({ user_id: req.session.user._id }).populate('products.product_id')
            let Price = cartData.products[0].price

            if (coupen.used == false) {
                
                const cartPrice = cartData.totalCartPrice +0;  //  CartPrice
                const coupenDis = coupen.discount     //  Coupen Discount
                
                if (coupen) {

                    const offerValue = Math.round((cartPrice) - (cartPrice * coupenDis / 100));

                    const coupenDiscount = cartPrice - offerValue
                
                    const updateCart = await cart.findOneAndUpdate({ _id: cartData._id }, { $set: { totalCartPrice: offerValue, percentage : coupen.discount , coupenDiscount} }, { new: true });
                    // await Coupen.findOneAndUpdate({coupen_id:coupenIdd},{$set:{used:true}})
                
                    if (updateCart) {
                               
                        req.flash("coupenDiscount", '-'+coupenDiscount);
                        req.flash('coupenSpan','Coupen Discount')
                        req.flash('coupen_id',coupenIdd)
                        res.redirect("/checkout");
                
                    }
                }

            } else {

                req.flash('flash', 'usedOne');
                res.redirect("/checkout");

            }

        } else {

            console.log();

        }
        
    } catch (error) {

        next(error)

        
    }

};

const removeCop = async (req, res , next) => {
    
    try {
        const usedCoupen_id = req.body.coupen_id
        console.log(usedCoupen_id,req.body)  
        const userIdd = req.session.user._id
        // const coupen = await Coupen.findOne({coupen_id:})
        const cartData = await cart.findOne({ user_id: userIdd });
        const coupen = await Coupen.findOneAndUpdate({})
        const addPrice = cartData.coupenDiscount

        const updateCart = await cart.findOneAndUpdate({ user_id: userIdd }, { $set: { coupenDiscount: 0, percentage: 0 } });   //  Update Cart
        await cart.updateOne({user_id : userIdd} , {$inc : {totalCartPrice : addPrice}})
        // await Coupen.findOneAndUpdate({coupen_id:usedCoupen_id},{$set:{used:false}})
        if (updateCart) {
            
            res.send({ succ: true });
        }
        
    } catch (error) {

        next(error,req,res);

        
    }

};


module.exports={
    loadCoupen,
    checkValidCoupen,
    useCoupen,
    removeCop
}
